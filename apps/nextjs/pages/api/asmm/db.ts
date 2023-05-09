import sql from 'mssql';

const PASSWORD = process.env.ASMM_DATABASE_PASSWORD;

export function connect(sqlLib: typeof sql) {
	return sqlLib.connect(`Server=tcp:${process.env.ASMM_DATABASE_URL},1433;Initial Catalog=ASMM_DATA;Persist Security Info=False;User ID=asmmsqlaccess;Password=${PASSWORD};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;`)
}
