package handler

import "music_system/model"

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
