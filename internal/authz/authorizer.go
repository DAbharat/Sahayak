package authz

import (
	"fmt"
	"os"

	cedar "github.com/cedar-policy/cedar-go"
	"github.com/cedar-policy/cedar-go/types"
)

type Authorizer struct {
	policies *cedar.PolicySet
}

func NewAuthorizer() (*Authorizer, error) {
	policyBytes, err := os.ReadFile("internal/authz/policies/profile.cedar")
	if err != nil {
		return nil, fmt.Errorf("read cedar policies: %w", err)
	}

	policies, err := cedar.NewPolicySetFromBytes(
		"profile.cedar",
		policyBytes,
	)
	if err != nil {
		return nil, fmt.Errorf("parse cedar policies: %w", err)
	}

	return &Authorizer{
		policies: policies,
	}, nil
}

func (a *Authorizer) CanReadProfile(userID, accountID int64) (bool, error) {
	principal := cedar.NewEntityUID(
		"User",
		cedar.String(fmt.Sprintf("%d", userID)),
	)

	action := cedar.NewEntityUID(
		"Action",
		cedar.String("ReadProfile"),
	)

	resource := cedar.NewEntityUID(
		"Profile",
		cedar.String(fmt.Sprintf("%d", accountID)),
	)

	owner := cedar.NewEntityUID(
		"User",
		cedar.String(fmt.Sprintf("%d", accountID)),
	)

	entities := types.EntityMap{
		principal: {
			UID:        principal,
			Parents:    cedar.NewEntityUIDSet(),
			Attributes: cedar.NewRecord(nil),
			Tags:       cedar.NewRecord(nil),
		},
		owner: {
			UID:        owner,
			Parents:    cedar.NewEntityUIDSet(),
			Attributes: cedar.NewRecord(nil),
			Tags:       cedar.NewRecord(nil),
		},
		resource: {
			UID:     resource,
			Parents: cedar.NewEntityUIDSet(),
			Attributes: cedar.NewRecord(types.RecordMap{
				"owner": owner,
			}),
			Tags: cedar.NewRecord(nil),
		},
	}

	request := cedar.Request{
		Principal: principal,
		Action:    action,
		Resource:  resource,
		Context:   cedar.NewRecord(nil),
	}

	decision, diagnostic := cedar.Authorize(
		a.policies,
		entities,
		request,
	)

	if len(diagnostic.Errors) > 0 {
		return false, fmt.Errorf("%v", diagnostic.Errors[0])
	}

	return decision == cedar.Allow, nil
}

func (a *Authorizer) CanUpdateProfile(userID, accountID int64) (bool, error) {
	principal := cedar.NewEntityUID(
		"User",
		cedar.String(fmt.Sprintf("%d", userID)),
	)

	action := cedar.NewEntityUID(
		"Action",
		cedar.String("UpdateProfile"),
	)

	resource := cedar.NewEntityUID(
		"Profile",
		cedar.String(fmt.Sprintf("%d", accountID)),
	)

	owner := cedar.NewEntityUID(
		"User",
		cedar.String(fmt.Sprintf("%d", accountID)),
	)

	entities := types.EntityMap{
		principal: {
			UID:        principal,
			Parents:    cedar.NewEntityUIDSet(),
			Attributes: cedar.NewRecord(nil),
			Tags:       cedar.NewRecord(nil),
		},
		owner: {
			UID:        owner,
			Parents:    cedar.NewEntityUIDSet(),
			Attributes: cedar.NewRecord(nil),
			Tags:       cedar.NewRecord(nil),
		},
		resource: {
			UID:     resource,
			Parents: cedar.NewEntityUIDSet(),
			Attributes: cedar.NewRecord(types.RecordMap{
				"owner": owner,
			}),
		},
	}

	request := cedar.Request{
		Principal: principal,
		Action:    action,
		Resource:  resource,
		Context:   cedar.NewRecord(nil),
	}

	decision, diagnostic := cedar.Authorize(
		a.policies,
		entities,
		request,
	)

	if len(diagnostic.Errors) > 0 {
		return false, fmt.Errorf("%v", diagnostic.Errors[0])
	}

	return decision == cedar.Allow, nil
}
