package filter

type FindMusicHistory struct {
	ID      string `json:"id"`
	MusicID string `json:"music_id"`

	StartTime int64 `json:"start_time"`
	EndTime   int64 `json:"end_time"`
}

type ListMusicHistory struct {
	IDs      []string `json:"ids"`
	MusicIDs []string `json:"music_ids"`

	StartTime int64 `json:"start_time"`
	EndTime   int64 `json:"end_time"`

	Limit  int `json:"limit"`
	Offset int `json:"offset"`
}

type DeleteMusicHistory struct {
	ID string `json:"id"`
}
