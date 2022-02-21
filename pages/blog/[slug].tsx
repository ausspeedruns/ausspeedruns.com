import Link from 'next/link';
import { GetStaticPathsResult, GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import { DocumentRenderer } from '@keystone-6/document-renderer';
import { query } from '.keystone/api';

import Navbar from '../../components/Navbar/Navbar';
import styles from '../../styles/Blog.slug.module.scss';
import Head from 'next/head';
import Footer from '../../components/Footer/Footer';

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

export default function PostPage({ post }: { post: Post }) {
	const authorNames = post.author.map((author) => author.username);
	const authorString = authorNames.map((author, i) => {
		// If only one name or second last in the list to not include a comma
		if (authorNames.length === 1 || i === authorNames.length - 2) {
			return <Link key={author} href={`/user/${author}`}>{author}</Link>;
		}

		// End of names
		if (i === authorNames.length - 1) {
			return (
				<>
					<span> and </span>
					<Link key={author} href={`/user/${author}`}>{author}</Link>
				</>
			);
		}

		return (
			<>
				<Link key={author} href={`/user/${author}`}>{author}</Link>
				<span>, </span>
			</>
		);
	});
	// if (authorNames.length > 1) {
	// 	authorString = authorNames.slice(0, -1).join(', ') + ' and ' + authorNames.slice(-1);
	// } else {
	// 	authorString = authorNames[0];
	// }

	return (
		<div className={`app ${styles.app}`}>
			<Head>
				<title>{post.title} - AusSpeedruns</title>
			</Head>
			<Navbar />
			<main className={`content ${styles.content}`}>
				<h1 className={styles.title}>{post.title}</h1>
				<div className={styles.metaData}>
					<span>By {authorString}</span>
					<span>Published {new Date(post.publishedDate).toLocaleString('en-AU', { hour12: true })}</span>
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

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
	const posts = (await query.Post.findMany({
		query: `slug`,
	})) as { slug: string }[];

	const paths = posts.filter(({ slug }) => !!slug).map(({ slug }) => `/blog/${slug}`);

	return {
		paths,
		fallback: false,
	};
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
	const post = (await query.Post.findOne({
		where: { slug: params!.slug as string },
		query: 'id title content { document } publishedDate editedDate author { username }',
	})) as Post | null;
	if (!post) {
		return { notFound: true };
	}
	return { props: { post } };
}
