import Link from 'next/link';
import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult, InferGetStaticPropsType } from 'next';
import { DocumentRenderer } from '@keystone-6/document-renderer';

import Navbar from '../../components/Navbar/Navbar';
import styles from '../../styles/Blog.slug.module.scss';
import Head from 'next/head';
import Footer from '../../components/Footer/Footer';
import { useRouter } from 'next/router';
import DiscordEmbed from '../../components/DiscordEmbed';
import { useAuth } from '../../components/auth';
import { useQuery } from 'urql';
import { gql } from '@keystone-6/core';
import { useState } from 'react';

type Post = {
	id: string;
	title: string;
	content: any;
	publishedDate?: string;
	editedDate?: string;
	author: {
		username: string;
	}[];
};

function AuthorNames(authors: string[]) {
	return authors.map((author, i) => {
		// If only one name or second last in the list to not include a comma
		if (authors.length === 1 || i === authors.length - 2) {
			return (
				<Link key={author} href={`/user/${author}`}>
					{author}
				</Link>
			);
		}

		// End of names
		if (i === authors.length - 1) {
			return (
				<>
					<span> and </span>
					<Link key={author} href={`/user/${author}`}>
						{author}
					</Link>
				</>
			);
		}

		return (
			<>
				<Link key={author} href={`/user/${author}`}>
					{author}
				</Link>
				<span>, </span>
			</>
		);
	});
}

export default function PostPage() {
	const router = useRouter();

	const [queryPost, requeryPost] = useQuery<{post: Post}>({
		query: gql`
			query ($post: String) {
				post(where: { slug: $post }) {
					id
					title
					content {
						document
					}
					publishedDate
					editedDate
					author {
						username
					}
				}
			}
		`,
		variables: {
			post: router.query.slug,
		},
	});

	if (queryPost.fetching) {
		return (
			<div className={styles.app}>
				<Navbar />
				<main className={styles.content}>Loading...</main>
			</div>
		);
	}

	if (queryPost.error || !queryPost.data) {
		console.error(queryPost.error);
		return (
			<div className={styles.app}>
				<Navbar />
				<main className={styles.content}>Error</main>
			</div>
		);
	}

	const post = queryPost.data.post;
	const authorString = AuthorNames(post.author.map((author) => author.username));

	return (
		<div className={styles.app}>
			<Head>
				<title>{post.title} - AusSpeedruns</title>
				<DiscordEmbed title={`${post.title} - Blog Post - AusSpeedruns`} pageUrl={`/blog/${router.query.slug}`} />
			</Head>
			<Navbar />
			<main className={styles.content}>
				<h1 className={styles.title}>{post.title}</h1>
				<div className={styles.metaData}>
					<span>By {authorString}</span>
					{post.publishedDate ? (
						<span>Published {new Date(post.publishedDate).toLocaleString('en-AU', { hour12: true })}</span>
					) : (
						<span>Not yet published</span>
					)}
				</div>
				{post.editedDate && (
					<span className={styles.edited}>
						Last Edited {new Date(post.editedDate).toLocaleString('en-AU', { hour12: true })}
					</span>
				)}
				<DocumentRenderer document={post.content.document} />
			</main>
			<Footer className={styles.footer} />
		</div>
	);
}
