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

// function AuthorNames(authors: string[]) {
// 	return authors.map((author, i) => {
// 		// If only one name or second last in the list to not include a comma
// 		if (authors.length === 1 || i === authors.length - 2) {
// 			return (
// 				<Link key={author} href={`/user/${author}`}>
// 					{author}
// 				</Link>
// 			);
// 		}

// 		// End of names
// 		if (i === authors.length - 1) {
// 			return (
// 				<>
// 					<span> and </span>
// 					<Link key={author} href={`/user/${author}`}>
// 						{author}
// 					</Link>
// 				</>
// 			);
// 		}

// 		return (
// 			<>
// 				<Link key={author} href={`/user/${author}`}>
// 					{author}
// 				</Link>
// 				<span>, </span>
// 			</>
// 		);
// 	});
// }

// export default function PostPage({ post }: { post: Post }) {
// 	const router = useRouter();
// 	const authorString = AuthorNames(post.author.map((author) => author.username));

// 	return (
// 		<div className={styles.app}>
// 			<Head>
// 				<title>{post.title} - AusSpeedruns</title>
// 				<DiscordEmbed title={`${post.title} - Blog Post - AusSpeedruns`} pageUrl={`/blog/${router.query.slug}`} />
// 			</Head>
// 			<Navbar />
// 			<main className={styles.content}>
// 				<h1 className={styles.title}>{post.title}</h1>
// 				<div className={styles.metaData}>
// 					<span>By {authorString}</span>
// 					<span>Published {new Date(post.publishedDate).toLocaleString('en-AU', { hour12: true })}</span>
// 				</div>
// 				{post.editedDate && (
// 					<span className={styles.edited}>
// 						Last Edited {new Date(post.editedDate).toLocaleString('en-AU', { hour12: true })}
// 					</span>
// 				)}
// 				<DocumentRenderer document={post.content.document} />
// 			</main>
// 			<Footer className={styles.footer} />
// 		</div>
// 	);
// }

// export async function getStaticPaths(): Promise<GetStaticPathsResult> {
// 	const posts = (await query.Post.findMany({
// 		query: `slug`,
// 	})) as { slug: string }[];

// 	const paths = posts.filter(({ slug }) => !!slug).map(({ slug }) => `/blog/${slug}`);

// 	return {
// 		paths,
// 		fallback: false,
// 	};
// }

// export async function getStaticProps({ params }: GetStaticPropsContext) {
// 	const post = (await query.Post.findOne({
// 		where: { slug: params!.slug as string },
// 		query: 'id title content { document } publishedDate editedDate author { username }',
// 	})) as Post | null;
// 	if (!post) {
// 		return { notFound: true };
// 	}
// 	return { props: { post }, revalidate: 60 };
// }

export default function PostPage() {
	const router = useRouter();

	return (
		<div className={styles.app}>
			<Head>
				<title>Blog WIP - AusSpeedruns</title>
				<DiscordEmbed title={`Blog WIP  - Blog Post - AusSpeedruns`} pageUrl={`/blog/${router.query.slug}`} />
			</Head>
			<Navbar />
			<main className={styles.content}>
				<h1 className={styles.title}>Blog under reconstruction</h1>
				<p>Blog should be backup &quot;soon&quot; -Clubwho</p>
			</main>
			<Footer className={styles.footer} />
		</div>
	);
}
