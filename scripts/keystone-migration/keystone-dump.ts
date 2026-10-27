import fs from "node:fs";
import readline from "node:readline";

/**
 * Minimal reader for plain-format `pg_dump -Fp` files (COPY data, not --inserts).
 * Parses CREATE TABLE column types and COPY blocks so rows come back typed like node-postgres would return them.
 */

type Row = Record<string, any>;
type Converter = (value: string) => unknown;

function unquoteIdent(ident: string) {
	return ident.startsWith('"') ? ident.slice(1, -1).replace(/""/g, '"') : ident;
}

// `public."Event"` / `public.foo` / `"Event"` -> `Event`
function tableName(qualified: string) {
	const match = qualified.match(/(?:("(?:[^"]|"")+"|[^."\s]+)\.)?("(?:[^"]|"")+"|[^."\s]+)$/);
	if (!match) throw new Error(`Unrecognised table name: ${qualified}`);
	return unquoteIdent(match[2]);
}

function splitIdentList(list: string) {
	return (list.match(/"(?:[^"]|"")+"|[^,\s]+/g) ?? []).map(unquoteIdent);
}

function converterFor(type: string): Converter {
	const t = type.toLowerCase();
	if (t.endsWith("[]")) {
		throw new Error(`Array column type "${type}" is not supported by the dump reader`);
	}
	if (t === "boolean") return (v) => v === "t";
	if (t === "integer" || t === "smallint") return (v) => Number.parseInt(v, 10);
	// node-postgres returns bigint/numeric as strings
	if (t === "bigint" || t.startsWith("numeric")) return (v) => v;
	if (t === "double precision" || t === "real") return (v) => Number(v);
	if (t === "json" || t === "jsonb") return (v) => JSON.parse(v);
	// Keystone (Prisma) stores UTC in `timestamp without time zone`
	if (t.startsWith("timestamp") && t.includes("without time zone")) {
		return (v) => new Date(`${v.replace(" ", "T")}Z`);
	}
	if (t.startsWith("timestamp") && t.includes("with time zone")) {
		return (v) => new Date(v.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00"));
	}
	if (t === "date") return (v) => v;
	return (v) => v;
}

const ESCAPES: Record<string, string> = { b: "\b", f: "\f", n: "\n", r: "\r", t: "\t", v: "\v", "\\": "\\" };

// Decodes one field of COPY text format
function decodeField(raw: string): string | null {
	if (raw === "\\N") return null;
	if (!raw.includes("\\")) return raw;
	return raw.replace(/\\(x[0-9a-fA-F]{1,2}|[0-7]{1,3}|.)/g, (_, esc: string) => {
		if (esc[0] === "x") return String.fromCharCode(Number.parseInt(esc.slice(1), 16));
		if (/^[0-7]/.test(esc)) return String.fromCharCode(Number.parseInt(esc, 8));
		return ESCAPES[esc] ?? esc;
	});
}

export class KeystoneDump {
	private tables = new Map<string, Row[]>();

	private constructor() {}

	static async load(filePath: string) {
		const dump = new KeystoneDump();
		const columnTypes = new Map<string, Map<string, string>>();

		const lines = readline.createInterface({
			input: fs.createReadStream(filePath, { encoding: "utf8" }),
			crlfDelay: Infinity,
		});

		let createTable: { name: string; types: Map<string, string> } | null = null;
		let copy: { name: string; columns: string[]; converters: Converter[]; rows: Row[] } | null = null;

		for await (const line of lines) {
			if (copy) {
				if (line === "\\.") {
					dump.tables.set(copy.name, copy.rows);
					copy = null;
					continue;
				}
				const fields = line.split("\t");
				if (fields.length !== copy.columns.length) {
					throw new Error(
						`Malformed COPY row in ${copy.name}: expected ${copy.columns.length} fields, got ${fields.length}`,
					);
				}
				const row: Row = {};
				for (let i = 0; i < fields.length; i++) {
					const value = decodeField(fields[i]);
					row[copy.columns[i]] = value === null ? null : copy.converters[i](value);
				}
				copy.rows.push(row);
				continue;
			}

			if (createTable) {
				if (line.startsWith(")")) {
					columnTypes.set(createTable.name, createTable.types);
					createTable = null;
					continue;
				}
				const col = line
					.trim()
					.match(
						/^("(?:[^"]|"")+"|[^\s"]+)\s+(.+?)(?:\s+(?:DEFAULT|NOT NULL|NULL|CONSTRAINT|GENERATED|COLLATE)\b.*)?,?$/,
					);
				if (col && !/^(CONSTRAINT|PRIMARY|UNIQUE|CHECK|FOREIGN)\b/i.test(col[1])) {
					createTable.types.set(unquoteIdent(col[1]), col[2].replace(/,$/, ""));
				}
				continue;
			}

			const createMatch = line.match(/^CREATE TABLE (.+?) \($/);
			if (createMatch) {
				createTable = { name: tableName(createMatch[1]), types: new Map() };
				continue;
			}

			const copyMatch = line.match(/^COPY (.+?) \((.*)\) FROM stdin;$/);
			if (copyMatch) {
				const name = tableName(copyMatch[1]);
				const columns = splitIdentList(copyMatch[2]);
				const types = columnTypes.get(name);
				if (!types) throw new Error(`COPY for ${name} found before its CREATE TABLE`);
				copy = {
					name,
					columns,
					converters: columns.map((c) => converterFor(types.get(c) ?? "text")),
					rows: [],
				};
			}
		}

		if (copy) throw new Error(`Dump ended inside COPY block for ${copy.name} (truncated file?)`);
		if (dump.tables.size === 0) {
			throw new Error("No COPY data found. Was the dump made with `pg_dump -Fp` (and without --inserts)?");
		}

		return dump;
	}

	/** Same shape as a node-postgres result for `SELECT * FROM table`. */
	query(table: string): { rows: Row[] } {
		const rows = this.tables.get(table);
		if (!rows) throw new Error(`Table "${table}" not found in dump`);
		return { rows };
	}

	summary() {
		return [...this.tables].map(([name, rows]) => `${name}: ${rows.length}`).join(", ");
	}
}
