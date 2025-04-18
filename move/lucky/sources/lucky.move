module lucky::lucky;

use std::string::String;
use sui::random;
use sui::vec_set;

const EBOARD_END: u64 = 1;
const EBOARD_PUBLISH: u64 = 2;
const EBOARD_UNPUBLISH: u64 = 3;
const EBOARD_CONFIRM_SATISFED: u64 = 4;
const EBOARD_CONFIRMED_ADDRESS: u64 = 5;
const EBOARD_EARLY: u64 = 6;
const EBOARD_CONFIRM_UNSATISFED: u64 = 7;


public struct LUCKY has drop {}

public struct AdminCap has key, store {
    id: UID,
}

public struct Record has key {
    id: UID,
    draws: vector<ID>,
}

// todo: add name
public struct Draw has key, store {
    id: UID,
    end_at: u64,
    confirm_threshold: u64,
    publish: bool,
    confirm_by: vector<address>,
    items: vector<ItemInfo>,
    num_winners: u64,
    lucky: vector<u64>,
}

public struct ItemInfo has store, drop {
    name: String,
    desc: String,
    url: String,
}

fun init(_wtn: LUCKY, ctx: &mut TxContext) {
   let sender = ctx.sender();
   transfer::public_transfer(
    AdminCap { id: object::new(ctx) },
     sender
    );
    transfer::share_object(Record{
        id: object::new(ctx),
        draws: vector::empty(),
    })
}

public fun new(
    _cap: &AdminCap, 
    record: &mut Record,
    end_at: u64, 
    confirm_threshold: u64, 
    num_winners: u64, 
    ctx: &mut TxContext
    ) {
        let r = Draw {
            id: object::new(ctx),
            end_at,
            confirm_threshold,
            publish: false,
            confirm_by: vector::empty(),
            items: vector::empty(),
            num_winners,
            lucky: vector::empty(),
        };
    record.draws.push_back(r.id.to_inner());
    transfer::public_share_object(r);
}

public fun add(_cap: &AdminCap, r: &mut Draw, name: String, desc: String, url: String, ctx: &mut TxContext) {
    assert!(r.end_at > ctx.epoch(), EBOARD_END);
    assert!(!r.publish, EBOARD_PUBLISH);
    
    r.items.push_back(
        ItemInfo {
            name,
            desc,
            url,
        }
    );
}

public fun remove(_cap: &AdminCap, r: &mut Draw, index: u64,  ctx: &mut TxContext) {
    assert!(r.end_at > ctx.epoch(), EBOARD_END);
    assert!(!r.publish, EBOARD_PUBLISH);

    r.items.remove(index);
}

public fun publish(_cap: &AdminCap, r: &mut Draw, ctx: &mut TxContext) {
    assert!(r.end_at > ctx.epoch(), EBOARD_END);
    assert!(!r.publish, EBOARD_PUBLISH);

    r.publish = true;
}

public fun confirm(r: &mut Draw, ctx: &mut TxContext) {
    assert!(r.end_at > ctx.epoch(), EBOARD_END);
    assert!(r.publish, EBOARD_UNPUBLISH);
    assert!(r.confirm_by.length() < r.confirm_threshold, EBOARD_CONFIRM_SATISFED);
    
    let sender = ctx.sender();
    assert!(!r.confirm_by.contains(&sender), EBOARD_CONFIRMED_ADDRESS);
    r.confirm_by.push_back(sender);
}

entry fun lucky(_cap: &AdminCap, r: &mut Draw, rd: &random::Random, ctx: &mut TxContext) {
    assert!(ctx.epoch() > r.end_at, EBOARD_EARLY);
    assert!(r.confirm_by.length() >= r.confirm_threshold, EBOARD_CONFIRM_UNSATISFED);

    let mut lucky_set = vec_set::empty<u64>();
    let mut rg = random::new_generator(rd, ctx);
    if (r.items.length() <= r.num_winners) {
        let mut i = 0;
        while (i < r.items.length()) {
            lucky_set.insert(i);
            i = i + 1;
        }
    } else {
        while (lucky_set.size() < r.num_winners) {
            let n = rg.generate_u64() % r.items.length();
            lucky_set.insert(n);
        };
    };

    r.lucky = lucky_set.into_keys();
}