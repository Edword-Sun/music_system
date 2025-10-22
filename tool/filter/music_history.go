package filter

type FindMusicHistory struct {
	ID      string `json:"id"`
	UserID  string `json:"user_id"`
	MusicID string `json:"music_id"`

	StartTime int64 `json:"start_time"`
	EndTime   int64 `json:"end_time"`
}

type DeleteMusicHistory struct {
	ID string `json:"id"`
}
