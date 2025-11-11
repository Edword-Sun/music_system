package handler

import (
	"music_system/model"
)

// CreateComment

type CreateCommentReq struct {
	//ID        string `json:"id"`
	UserID    string `json:"user_id"`
	MusicID   string `json:"music_id"`
	CommentID string `json:"comment_id"` // 如果是评论的评论，就可以用这个ID

	// 评论内容
	Content string ` json:"content"` // 评论内容
}
type CreateCommentResp struct {
	ID string `json:"id"`
}

// FindComment

type FindCommentReq struct {
	ID      string `json:"id"`
	MusicID string `json:"music_id"`
	UserID  string `json:"user_id"`

	StartTime int64 `json:"start_time"`
	EndTime   int64 `json:"end_time"`
}
type FindCommentResp struct {
	Data []*model.Comment `json:"data"`
}

// ListComment

type ListCommentReq struct {
	ID      []string `json:"id"`
	MusicID []string `json:"music_id"`
	UserID  []string `json:"user_id"`

	StartTime int64 `json:"start_time"`
	EndTime   int64 `json:"end_time"`

	Page int `json:"page"`
	Size int `json:"size"`
}

type ListCommentResp struct {
	Data  []*model.Comment `json:"data"`
	Total int64            `json:"total"`
}

// UpdateComment

type UpdateCommentReq struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	MusicID   string `json:"music_id"`
	CommentID string `json:"comment_id"` // 如果是评论的评论，就可以用这个ID

	// 评论内容
	Content string `json:"content"` // 评论内容

}
type UpdateCommentResp struct {
}

type DeleteCommentReq struct {
	ID string `json:"id"`
}
type DeleteCommentResp struct{}
