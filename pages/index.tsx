import { loadComments } from "@/store/commentsSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect } from "react";
import Head from "next/head";
import { GetStaticProps } from "next";
import { MongoClient } from "mongodb";
import { CommentType, Reply, User } from "@/models/types";
import AddComment from "@/components/AddComment";
import CommentsList from "@/components/Comments/CommentsList";

import classes from "../styles/HomePage.module.css";

const LOGGEDIN_USER: User = {
	image: {
		png: "/images/avatars/image-juliusomo.png",
		webp: "/images/avatars/image-juliusomo.webp"
	},
	username: "juliusomo"
};

const HomePage: React.FC<{ comments: CommentType[] }> = (props) => {
	const dispatch = useDispatch();
	const comments: CommentType[] = useSelector(
		(state: RootState) => state.comments.comments
	);

	useEffect(() => {
		dispatch(loadComments(props.comments));
	}, [props.comments, dispatch]);

	return (
		<>
			<Head>
				<title>FM - Interactive Comments Section</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/images/favicon-32x32.png" />
			</Head>
			<main className={classes.app}>
				<CommentsList comments={comments} loggedInUser={LOGGEDIN_USER.username} />
				<AddComment loggedinUser={LOGGEDIN_USER} type="comment" />
			</main>
			<footer style={{ marginTop: "2em", color: "black" }}>
				Challenge by{" "}
				<a href="https://www.frontendmentor.io?ref=challenge" target="_blank">
					Frontend Mentor
				</a>
				. Coded by{" "}
				<a href="#" target="_blank">
					João Lucas Dias
				</a>
				.
			</footer>
		</>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	const client = await MongoClient.connect(process.env.MONGODB_URI!);
	const db = client.db("interactive-comments-section");
	const dataCollection = db.collection("comments");
	const data = await dataCollection.find().toArray();

	const comments: CommentType[] = data
		.map((comment) => {
			return {
				id: comment._id.toString(),
				user: comment.user,
				createdAt: comment.createdAt,
				content: comment.content,
				replies: comment.replies.map((reply: Reply, idx: number) => {
					return {
						id: `${comment._id.toString()}_reply${idx}`,
						user: reply.user,
						createdAt: reply.createdAt,
						content: reply.content,
						replyingTo: reply.replyingTo,
						score: reply.score
					};
				}),
				score: comment.score
			};
		})

	client.close();

	return {
		props: {
			comments: comments
		}
	};
};

export default HomePage;
