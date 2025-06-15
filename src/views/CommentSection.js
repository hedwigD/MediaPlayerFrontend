import {useState} from 'react';
import {InputField} from '@enact/sandstone/Input';
import Button from '@enact/sandstone/Button';
import Scroller from '@enact/sandstone/Scroller';
import BodyText from '@enact/sandstone/BodyText';
// eslint-disable-next-line
const CommentSection = ({videoId}) => {
	const [comments, setComments] = useState([
		{
			commentId: 1,
			memberNickname: 'user1',
			comment: '재밌는 영상이네요!',
			createdAt: '2025-06-15T22:21:01.207Z'
		},
		{
			commentId: 2,
			memberNickname: 'user2',
			comment: '두 번째 댓글입니다',
			createdAt: '2025-06-15T22:22:11.207Z'
		}
	]);

	const [inputValue, setInputValue] = useState('');

	const handleAddComment = () => {
		if (!inputValue.trim()) return;
		const newComment = {
			commentId: Date.now(),
			memberNickname: 'me',
			comment: inputValue,
			createdAt: new Date().toISOString()
		};
		setComments([newComment, ...comments]);
		setInputValue('');
	};

	const handleDelete = (id) => {
		setComments(comments.filter((c) => c.commentId !== id));
	};

	return (
		<div style={{padding: '2rem'}}>
			<h3>댓글</h3>
			<div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
				<InputField
					placeholder="댓글을 입력하세요"
					value={inputValue}
					// eslint-disable-next-line
					onChange={(e) => setInputValue(e.value)}
					style={{flex: 1}}
				/>
				{/* eslint-disable-next-line */}
				<Button onClick={handleAddComment}>등록</Button>
			</div>
			<Scroller style={{maxHeight: '300px'}}>
				{comments.map(({commentId, memberNickname, comment, createdAt}) => (
					<div key={commentId} style={{marginBottom: '1rem', borderBottom: '1px solid #444'}}>
						<BodyText>{memberNickname} | {new Date(createdAt).toLocaleString()}</BodyText>
						<BodyText>{comment}</BodyText>
						{/* eslint-disable-next-line */}
						<Button size="small" onClick={() => handleDelete(commentId)}>삭제</Button>
					</div>
				))}
			</Scroller>
		</div>
	);
};

export default CommentSection;