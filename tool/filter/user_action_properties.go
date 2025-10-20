package filter

type FindUserActionProperties struct {
	ID      string
	UserID  string
	MusicID string

	IsActiveThumb bool
	Thumb         bool

	IsActiveUnThumb bool
	UnThumb         bool

	IsActiveCollected bool
	Collected         bool

	IsActiveShare bool
	Share         bool

	StartTime int64
	EndTime   int64
}

type DeleteUserActionProperties struct {
	ID string
}
