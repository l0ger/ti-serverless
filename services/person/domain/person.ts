/** Value object for a person's postal address. */
export interface Address {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
}

/**
 * Core domain entity of the person service. Framework-free: other layers
 * (use cases, repositories, API handlers) depend on this, never the reverse.
 * This is the internal domain model,
 * 
 */
export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: Address;
}
