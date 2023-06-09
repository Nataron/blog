import { firestore, getUserWithUsername, postToJSON } from "~/lib/firebase";
import { useDocumentData } from 'react-firebase-hooks/firestore';
import PostContent from "~/components/PostContent";

export const getStaticPaths = async () => {
    const snapshot = await firestore.collectionGroup("posts").get();

    const paths = snapshot.docs.map((doc) => {
        const { slug, username } = doc.data();
        return {
            params: { username, slug },
        };
    })
    return {
        paths,
        fallback: "blocking",
    };
};

export const getStaticProps = async (context) => {
    const { username, slug } = context.params;
    const userDoc = await getUserWithUsername(username);

    let post;
    let path = '';

    if (userDoc) {
        const postRef = userDoc.ref.collection("posts").doc(slug);
        post = postToJSON(await postRef.get());

        path = postRef.path;
    }

    return {
        props: { post, path },
        revalidate: 5000,
    };

}

const Post = (props) => {
    const postRef = firestore.doc(props.path);
    const [realtimePost] = useDocumentData(postRef);

    const post = realtimePost || props.post;

    return (
        <main>

        <section>
          <PostContent post={post} />
        </section>

        <aside className="card">
          <p>
            <strong>{post.heartCount || 0} 🤍</strong>
          </p>

        </aside>
      </main>
    )
}

export default Post;
