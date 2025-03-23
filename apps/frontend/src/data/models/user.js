export class User {
  constructor({
    userID,
    firstName,
    lastName,
    firebaseID,
    email,
    notifications,
    createdAt,
  }) {
    this.userID = userID;
    this.firstName = firstName;
    this.lastName = lastName;
    this.firebaseID = firebaseID;
    this.email = email;
    this.notifications = notifications ? Array.from(notifications) : [];
    this.createdAt = createdAt;
  }
}
