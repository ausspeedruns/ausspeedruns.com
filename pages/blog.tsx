import React from 'react';
import { InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import Head from 'next/head';

import { query } from '.keystone/api';
import NavBar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import styles from '../styles/Blog.module.scss';

type Post = {
	id: string;
	title: string;
	slug: string;
	author: {
		username: string;
	}[];
};

export default function BlogPage({ posts }: InferGetStaticPropsType<typeof getStaticProps>) {
	console.log(posts[0])
	
	return (
		<div className="app">
			<Head>
				<title>Blog - AusSpeedruns</title>
			</Head>
			<NavBar />
			<main className={`content ${styles.content}`}>
				<h1>Blog</h1>
				<div className={styles.blogPosts}>
					<ul>
						{/* Render each post with a link to the content page */}
						{posts.map((post) => (
							<li key={post.id}>
								<Link href={`/blog/${post.slug}`}>
									{post.title}
								</Link>
								{/* <span className={styles.authors}>
									BY {post.author.map(author => author.username)}
								</span> */}
							</li>
						))}
					</ul>
				</div>
			</main>
			<Footer className={styles.footer} />
		</div>
	);
}

// Here we use the Lists API to load all the posts we want to display
// The return of this function is provided to the `Home` component
export async function getStaticProps() {
	const posts = (await query.Post.findMany({ query: 'id title slug author { username }' })) as Post[];
	return {
		props: {
			posts,
		},
	};
}
