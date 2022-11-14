import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import styles from '../styles/Blog.module.scss';
import { useQuery, gql } from 'urql';
import DiscordEmbed from '../components/DiscordEmbed';

type Post = {
	id: string;
	title: string;
	slug: string;
	publishedDate: string;
	editedDate: string;
	intro: string;
	author: {
		username: string;
	}[];
	role: string;
	event?: {
		shortname: string;
	};
};

export default function BlogPage() {
	const [blogResults, blogQuery] = useQuery({
		query: gql`
			query {
				posts(orderBy: { publishedDate: desc }) {
					id
					title
					slug
					author {
						username
					}
					publishedDate
					editedDate
					intro
					role
					event {
						shortname
					}
				}
			}
		`,
	});

	return (
		<div className={styles.app}>
			<Head>
				<title>Blog - AusSpeedruns</title>
				<DiscordEmbed title="Blog - AusSpeedruns" description="AusSpeedruns blog" pageUrl="/blog" />
			</Head>
			<Navbar />
			<main className={styles.content}>
				<h1>Blog</h1>
				<div className={styles.blogPosts}>
					<ul>
						{/* Render each post with a link to the content page */}
						{blogResults.data?.posts.map((post) => (
							<BlogLink key={post.slug} post={post} />
						))}
					</ul>
				</div>
			</main>
			<Footer className={styles.footer} />
		</div>
	);
}

const BlogLink = ({ post }: { post: Post }) => {
	const linkHref = post.role === 'public' ? `/blog/${post.slug}` : `/staff-blog/${post.slug}`;
	return (
		<li key={post.id}>
			<div className={styles.linkTitle}>
				<div className={styles.articleTags}>
					{post.event && <ArticleTag event tag={post.event.shortname} />}

					<ArticleTag tag={post?.role} />
					<Link href={linkHref}>{post.title}</Link>
				</div>
				<span className={styles.date}>{new Date(post.publishedDate).toLocaleDateString()}</span>
			</div>
			{post.intro && <p>{post.intro}</p>}
			<div className={styles.articleTags}>{}</div>
			{/* <span className={styles.authors}>
			BY {post.author.map(author => author.username)}
		</span> */}
			<hr />
		</li>
	);
};

const ArticleTag = ({ tag, event }: { tag?: string; event?: boolean }) => {
	if (!tag || tag === 'public') return <></>;

	return (
		<div className={[styles.articleTag, styles[tag], event ? styles.event : ''].join(' ')}>{tag.replaceAll('_', ' ')}</div>
	);
};

// Here we use the Lists API to load all the posts we want to display
// The return of this function is provided to the `Home` component
// export async function getStaticProps() {
// 	const posts = (await query.Post.findMany({
// 		query: `id title slug author { username } publishedDate editedDate intro`,
// 		where: { published: { equals: true }, role: { equals: 'public' } },
// 	})) as Post[];
// 	return {
// 		props: {
// 			posts,
// 		},
// 	};
// }

function AllowedPosts(sessionData: Record<string, any>) {}
