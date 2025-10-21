package filter

type FindUserActionProperties struct {
	ID      string `json:"id"`
	UserID  string `json:"user_id"`
	MusicID string `json:"music_id"`

	IsActiveThumb bool `json:"is_active_thumb"`
	Thumb         bool `json:"thumb"`

	IsActiveUnThumb bool `json:"is_active_un_thumb"`
	UnThumb         bool `json:"un_thumb"`

	IsActiveCollected bool `json:"is_active_collected"`
	Collected         bool `json:"collected"`

	IsActiveShare bool `json:"is_active_share"`
	Share         bool `json:"share"`

	StartTime int64 `json:"start_time"`
	EndTime   int64 `json:"end_time"`
}

type DeleteUserActionProperties struct {
	ID string `json:"id"`
}
