package filter

type FindComment struct {
	ID      string
	MusicID string
	UserID  string

	StartTime int64
	EndTime   int64
}

//type UpdateComment struct {
//	ID string
//}

type DeleteComment struct {
	ID string
}
