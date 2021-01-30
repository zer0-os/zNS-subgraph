// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Domain extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Domain entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Domain entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Domain", id.toString(), this);
  }

  static load(id: string): Domain | null {
    return store.get("Domain", id) as Domain | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get parent(): BigInt {
    let value = this.get("parent");
    return value.toBigInt();
  }

  set parent(value: BigInt) {
    this.set("parent", Value.fromBigInt(value));
  }

  get domain(): string {
    let value = this.get("domain");
    return value.toString();
  }

  set domain(value: string) {
    this.set("domain", Value.fromString(value));
  }

  get owner(): Bytes {
    let value = this.get("owner");
    return value.toBytes();
  }

  set owner(value: Bytes) {
    this.set("owner", Value.fromBytes(value));
  }

  get controller(): Bytes {
    let value = this.get("controller");
    return value.toBytes();
  }

  set controller(value: Bytes) {
    this.set("controller", Value.fromBytes(value));
  }

  get approval(): Bytes | null {
    let value = this.get("approval");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set approval(value: Bytes | null) {
    if (value === null) {
      this.unset("approval");
    } else {
      this.set("approval", Value.fromBytes(value as Bytes));
    }
  }

  get image(): string {
    let value = this.get("image");
    return value.toString();
  }

  set image(value: string) {
    this.set("image", Value.fromString(value));
  }

  get resolver(): string {
    let value = this.get("resolver");
    return value.toString();
  }

  set resolver(value: string) {
    this.set("resolver", Value.fromString(value));
  }
}

export class Transfer extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Transfer entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Transfer entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Transfer", id.toString(), this);
  }

  static load(id: string): Transfer | null {
    return store.get("Transfer", id) as Transfer | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get domain(): string {
    let value = this.get("domain");
    return value.toString();
  }

  set domain(value: string) {
    this.set("domain", Value.fromString(value));
  }

  get blockNumber(): i32 {
    let value = this.get("blockNumber");
    return value.toI32();
  }

  set blockNumber(value: i32) {
    this.set("blockNumber", Value.fromI32(value));
  }

  get transactionID(): Bytes {
    let value = this.get("transactionID");
    return value.toBytes();
  }

  set transactionID(value: Bytes) {
    this.set("transactionID", Value.fromBytes(value));
  }

  get owner(): Bytes {
    let value = this.get("owner");
    return value.toBytes();
  }

  set owner(value: Bytes) {
    this.set("owner", Value.fromBytes(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get to(): Bytes {
    let value = this.get("to");
    return value.toBytes();
  }

  set to(value: Bytes) {
    this.set("to", Value.fromBytes(value));
  }
}
