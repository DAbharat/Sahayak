package repository

import (
	"github.com/DAbharat/Sahayak/internal/db/sqlc"
	"github.com/jackc/pgx/v5/pgtype"
)

func pgtypeText(s *string) pgtype.Text {
	if s == nil {
		return pgtype.Text{Valid: false}
	}
	return pgtype.Text{String: *s, Valid: true}
}

func pgtypeBool(b *bool) pgtype.Bool {
	if b == nil {
		return pgtype.Bool{Valid: false}
	}
	return pgtype.Bool{Bool: *b, Valid: true}
}

func pgtypeInt8(n *int64) pgtype.Int8 {
	if n == nil {
		return pgtype.Int8{Valid: false}
	}
	return pgtype.Int8{Int64: *n, Valid: true}
}

func pgtypeInt4FromInt32(n *int32) pgtype.Int4 {
	if n == nil {
		return pgtype.Int4{Valid: false}
	}
	return pgtype.Int4{Int32: *n, Valid: true}
}

func nullGender(s *string) sqlc.NullGender {
	if s == nil {
		return sqlc.NullGender{Valid: false}
	}
	return sqlc.NullGender{Gender: sqlc.Gender(*s), Valid: true}
}
