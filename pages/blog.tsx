import React, { useEffect, useState } from 'react';
import { InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import Head from 'next/head';

import { query } from '.keystone/api';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import styles from '../styles/Blog.module.scss';
import { useAuth } from '../components/auth';
import { useQuery } from 'urql';
import { gql } from '@keystone-6/core';
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
};

function reduceRoles(roles: { canReadRunnerInfo: boolean; canReadRunnerMgmt: boolean; canReadTech: boolean }[]) {
	return roles.reduce((prev, current) => {
		prev.canReadRunnerInfo ||= current.canReadRunnerInfo;
		prev.canReadRunnerMgmt ||= current.canReadRunnerMgmt;
		prev.canReadTech ||= current.canReadTech;
		return prev;
	});
}

export default function BlogPage() {
	const auth = useAuth();
	const [roles, setRole] = useState(['public']);
	const [viewablePosts, setViewablePosts] = useState<Post[]>([]);

	const [blogResults, blogQuery] = useQuery({
		query: gql`
			query ($roles: [PostRoleType!]) {
				posts(where: { published: { equals: true }, role: { in: $roles } }) {
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
				}
			}
		`,
		variables: { roles },
	});

	useEffect(() => {
		if (auth.ready && auth.sessionData) {
			const reducedRoles = reduceRoles(auth.sessionData.roles);

			const readable = [];
			if (reducedRoles.canReadRunnerInfo) readable.push('runner');
			if (reducedRoles.canReadRunnerMgmt) readable.push('runner_management');
			if (reducedRoles.canReadTech) readable.push('tech');
			setRole(['public', ...readable]);
			// blogQuery({roles: ['public', ...readable]});
		}
	}, [auth]);

	useEffect(() => {
		if (!blogResults.fetching && blogResults.data) {
			setViewablePosts(blogResults.data.posts);
		}

		if (blogResults.error) {
			console.error(blogResults.error);
		}
	}, [blogResults]);

	return (
		<div className="app">
			<Head>
				<title>Blog - AusSpeedruns</title>
				<DiscordEmbed title='Blog - AusSpeedruns' description='AusSpeedruns blog' pageUrl='/blog' />
			</Head>
			<Navbar />
			<main className={`content ${styles.content}`}>
				<h1>Blog</h1>
				<div className={styles.blogPosts}>
					<ul>
						{/* Render each post with a link to the content page */}
						{viewablePosts.map((post) => (
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
	return (
		<li key={post.id}>
			<div className={styles.linkTitle}>
				<div className={styles.articleTags}>
					<ArticleTag tag={post.role} />
					<Link href={`/blog/${post.slug}`}>{post.title}</Link>
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

const TagColours = {
	tech: {
		color: '#fff',
		background: '#000',
	},
	runner: {
		color: '#fff',
		background: '#290099',
	},
	runnermanagement: {
		color: '#000000',
		background: '#00ce67',
		label: 'Runner Management'
	},
};

const ArticleTag = ({ tag }: { tag: string }) => {
	if (tag === 'public') return <></>;

	return (
		<div className={[styles.articleTag, styles[tag]].join(' ')}>
			{tag.replaceAll('_', ' ')}
		</div>
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
