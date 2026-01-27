package handler

import "music_system/model"

type FindMusicHistoryReq struct {
	ID      string `json:"id"`
	MusicID string `json:"music_id"`

	StartTime int64 `json:"start_time"`
	EndTime   int64 `json:"end_time"`
}
type FindMusicHistoryResp struct {
	Data []*model.MusicHistory `json:"data"`
}

type ListMusicHistoryReq struct {
	IDs      []string `json:"ids"`
	MusicIDs []string `json:"music_ids"`

	StartTime int64 `json:"start_time"`
	EndTime   int64 `json:"end_time"`

	Page int `json:"page"`
	Size int `json:"size"`
}
type ListMusicHistoryResp struct {
	Data  []*model.MusicHistory `json:"data"`
	Total int64                 `json:"total"`
}

type AddMusicHistoryReq struct {
	MusicID string `json:"music_id"`
}
type AddMusicHistoryResp struct {
	ID string `json:"id"`
}

type UpdateMusicHistoryReq struct {
	ID      string `json:"id"`
	MusicID string `json:"music_id"`
}
type UpdateMusicHistoryResp struct{}

type DeleteMusicHistoryReq struct {
	ID      string   `json:"id"`
	IDs     []string `json:"ids"`
	MusicID string   `json:"music_id"`
}
type DeleteMusicHistoryResp struct{}
