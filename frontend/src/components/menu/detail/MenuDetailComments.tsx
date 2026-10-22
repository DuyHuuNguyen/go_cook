import { useState } from 'react';

interface Comment {
    id: number;
    userName: string;
    avatarSeed: number;
    timeAgo: string;
    rating?: number;
    text: string;
    reply?: {
        chefName: string;
        avatarSeed: number;
        timeAgo: string;
        text: string;
    };
}

const INITIAL_COMMENTS: Comment[] = [
    {
        id: 1,
        userName: 'Trần Bảo Trâm',
        avatarSeed: 12,
        timeAgo: '2 ngày trước',
        rating: 5,
        text: 'Mâm cơm này ăn rất ngon, đầu bếp nấu ăn vừa miệng. Canh chua cá nấu đúng chuẩn vị miền Tây luôn, cả nhà mình ai cũng khen. Sẽ tiếp tục đặt vào cuối tuần này.',
    },
    {
        id: 2,
        userName: 'Hoàng Lê',
        avatarSeed: 68,
        timeAgo: '5 ngày trước',
        text: 'Cho mình hỏi nếu nhà mình có 6 người lớn và 2 trẻ em thì nên đặt phần này định lượng bao nhiêu người là vừa ạ?',
        reply: {
            chefName: 'Đội ngũ GO Cook',
            avatarSeed: 32,
            timeAgo: '4 ngày trước',
            text: 'Dạ chào anh/chị, với gia đình mình thì nên chọn định lượng 6 người ăn trên hệ thống nhé, lượng đồ ăn sẽ được tự động nhân lên đủ dùng cho cả nhà ạ. Các bé có cần nấu nhạt hơn không nhớ ghi chú vào ô phía trên giúp em nha!',
        },
    },
];

export default function MenuDetailComments() {
    const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
    const [inputText, setInputText] = useState('');

    function handleSubmit() {
        const trimmed = inputText.trim();
        if (!trimmed) return;
        setComments((prev) => [
            {
                id: Date.now(),
                userName: 'Bạn',
                avatarSeed: 47,
                timeAgo: 'Vừa xong',
                text: trimmed,
            },
            ...prev,
        ]);
        setInputText('');
    }

    return (
        <div className="mdd-comments">
            <h3>
                <i className="fa-regular fa-comments mdd-icon-green" />
                Bình luận &amp; Hỏi đáp
            </h3>

            {/* Input area */}
            <div className="mdd-comment-input-row">
                <img
                    src="https://i.pravatar.cc/150?img=47"
                    alt="Bạn"
                    className="mdd-comment-avatar"
                />
                <div className="mdd-comment-input-wrap">
                    <textarea
                        rows={2}
                        placeholder="Bạn có thắc mắc gì về thực đơn này? hoặc để lại đánh giá của bạn..."
                        className="mdd-comment-textarea"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                    <div className="mdd-comment-submit-row">
                        <button
                            type="button"
                            className="gcp-btn gcp-btn-primary"
                            onClick={handleSubmit}
                            disabled={!inputText.trim()}
                        >
                            <i className="fa-regular fa-paper-plane" /> Gửi bình luận
                        </button>
                    </div>
                </div>
            </div>

            {/* Comment list */}
            <div className="mdd-comment-list">
                {comments.map((comment) => (
                    <div className="mdd-comment-item" key={comment.id}>
                        <img
                            src={`https://i.pravatar.cc/150?img=${comment.avatarSeed}`}
                            alt={comment.userName}
                            className="mdd-comment-avatar"
                        />
                        <div className="mdd-comment-body">
                            <div className="mdd-comment-bubble">
                                <div className="mdd-comment-meta">
                                    <h4>{comment.userName}</h4>
                                    <span>{comment.timeAgo}</span>
                                </div>
                                {comment.rating !== undefined && (
                                    <div className="mdd-comment-stars">
                                        {Array.from({ length: comment.rating }).map((_, i) => (
                                            <i className="fa-solid fa-star" key={i} />
                                        ))}
                                    </div>
                                )}
                                <p>{comment.text}</p>
                            </div>
                            {comment.reply && (
                                <div className="mdd-comment-reply">
                                    <img
                                        src={`https://i.pravatar.cc/150?img=${comment.reply.avatarSeed}`}
                                        alt={comment.reply.chefName}
                                        className="mdd-comment-avatar mdd-comment-avatar--sm mdd-reply-avatar"
                                    />
                                    <div className="mdd-comment-bubble mdd-comment-bubble--reply">
                                        <div className="mdd-comment-meta">
                                            <div className="mdd-reply-name-row">
                                                <h4>{comment.reply.chefName}</h4>
                                                <span className="mdd-reply-badge">Hỗ trợ</span>
                                            </div>
                                            <span>{comment.reply.timeAgo}</span>
                                        </div>
                                        <p>{comment.reply.text}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
