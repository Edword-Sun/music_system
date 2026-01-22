package handler

type FindGroupReq struct {
	ID   string `json:"id"`
	Name string `json:"name"`

	// 在json里找
	MusicIDs []string `json:"music_ids"`
}

type ListGroupReq struct {
	Name string `json:"name"`
	Page int    `json:"page"`
	Size int    `json:"size"`

	// 时间戳
	StartTime int64 `json:"start_time"`
	EndTime   int64 `json:"end_time"`
}
