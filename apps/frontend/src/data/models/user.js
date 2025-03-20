export class User {
  constructor({ userID, firstName, lastName, firebaseID, email, createdAt }) {
    this.userID = userID;
    this.firstName = firstName;
    this.lastName = lastName;
    this.firebaseID = firebaseID;
    this.email = email;
    this.createdAt = createdAt;
  }
}
