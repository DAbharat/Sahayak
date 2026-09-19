permit (
    principal,
    action == Action::"ReadProfile",
    resource
)
when {
    resource.owner == principal
};

permit (
    principal,
    action == Action::"UpdateProfile",
    resource
)
when {
    resource.owner == principal
};