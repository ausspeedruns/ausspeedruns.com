import Link from 'next/link';
import { GetStaticPathsResult, GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import { DocumentRenderer } from '@keystone-6/document-renderer';
import { query } from '.keystone/api';

import NavBar from '../../components/Navbar/Navbar';
import styles from '../../styles/blog.slug.module.scss';
import Head from 'next/head';
import Footer from '../../components/Footer/Footer';

type Post = {
	id: string;
	title: string;
	content: any;
};

export default function PostPage({ post }: { post: Post }) {
	return (
		<div className="app">
			<Head>
				<title>{post.title} - AusSpeedruns</title>
			</Head>
			<NavBar />
			<main className={styles.content}>
				<div>
					<Link href="/blog">
						<a>&larr; Blog</a>
					</Link>
				</div>
				<h1 className={styles.title}>{post.title}</h1>
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
		query: 'id title content { document }',
	})) as Post | null;
	if (!post) {
		return { notFound: true };
	}
	return { props: { post } };
}
