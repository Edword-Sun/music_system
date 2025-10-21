package filter

type FindComment struct {
	ID      string `json:"id"`
	MusicID string `json:"music_id"`
	UserID  string `json:"user_id"`

	StartTime int64 `json:"start_time"`
	EndTime   int64 `json:"end_time"`
}

type FindCommentWithPagination struct {
	ID      []string `json:"id"`
	MusicID []string `json:"music_id"`
	UserID  []string `json:"user_id"`

	StartTime int64 `json:"start_time"`
	EndTime   int64 `json:"end_time"`

	Limit  int `json:"limit"`
	Offset int `json:"offset"`
}

//type UpdateComment struct {
//	ID string `json:"id"`
//}

type DeleteComment struct {
	ID string `json:"id"`
}
