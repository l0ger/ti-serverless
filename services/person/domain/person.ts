export interface Address {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: Address;
}
