export class User {
  constructor({
    user_id,
    tbl_user_station_map,
    phone_number,
    first_name,
    address1,
    policy_object,
    identification_document_id,
    razorpay_customer_id,
    wallet_id,
    email,
    is_disabled,
    created_at,
    updated_at,
    disabled_at,
    disable_reason,
    user_type_id,
  }) {
    this.user_id = user_id;

    this.phone_number = phone_number;
    this.first_name = first_name;
    this.address1 = address1;
    this.identification_document_id = identification_document_id;
    this.razorpay_customer_id = razorpay_customer_id;
    this.wallet_id = wallet_id;
    this.email = email;
    this.is_disabled = is_disabled;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.disabled_at = disabled_at;
    this.disable_reason = disable_reason;
    this.user_type_id = user_type_id;
    this.is_profile_complete = this.first_name && this.email && this.address1;
  }
}
