module lucky::lucky;

use std::string::String;
use sui::event::emit;
use sui::package::{Self, Publisher};
use sui::random::Random;
use sui::table::{Self, Table};
use sui::vec_map::{Self, VecMap};

const E_Not_Valid_Basic_Pool_Info: u64 = 0;
const E_Not_Admin: u64 = 1;
const E_Can_Not_Edit_Fields: u64 = 2;
const E_Not_Valid_Fields: u64 = 3;
const E_Ended_Pool: u64 = 4;
const E_Can_Not_Confirm_Twice: u64 = 5;
const E_Need_Admins_Confirm: u64 = 6;
const E_Not_Seal_Approve: u64 = 7;
const E_Can_Not_Remove_All_Admins: u64 = 8;
const E_Not_Meet_Minimum_Participants: u64 = 9;

public struct LUCKY has drop {}

public struct Field has copy, drop, store {
    field: String,
    encryption: bool
}

public struct Info has copy, drop, store {
    fields: VecMap<String, String>,
    // If win the prize repeatedly, the prize will be postponed
    // `next` is used to quickly find the target
    next: u64
}

public struct LuckyPool has key {
    id: UID,

    // Desc
    name: String,
    description: String,
    creation_time: String,

    // Basic info
    minimum_participants: u64,
    number_of_winners: u64,
    allows_multiple_awards: bool,

    // Manually added fields (no more than 5)
    // Can't edit after creating
    fields: vector<Field>,

    // "address + apply time" as key
    application: Table<String, Info>,

    // Increment as key
    index: u64,
    pool: Table<u64, Info>,

    // Administrator list
    admins: vector<address>,

    // Before the lottery draw, more than half of the managers need to confirm
    confirmed: vector<address>,

    // The prize pool is completely over
    ended: bool
}

public struct LuckyPoolCreated has copy, drop {
    pool_id: ID,
    time: String
}

public struct WinnersEvent has copy, drop {
    pool_id: ID,
    winners_list: String,
    time: String
}

fun init(otw: LUCKY, ctx: &mut TxContext) {
    package::claim_and_keep(otw, ctx);
}

public fun create_pool(
    name: String,
    description: String,
    creation_time: String,
    minimum_participants: u64,
    number_of_winners: u64,
    allows_multiple_awards: bool,
    ctx: &mut TxContext
): LuckyPool {
    assert!(minimum_participants > 0 && number_of_winners > 0 && (allows_multiple_awards || number_of_winners <= minimum_participants), E_Not_Valid_Basic_Pool_Info);
    let id = object::new(ctx);
    let pool_id = id.to_inner();
    emit(LuckyPoolCreated {
        pool_id,
        time: creation_time
    });
    LuckyPool {
        id,
        name,
        description,
        creation_time,
        minimum_participants,
        number_of_winners,
        allows_multiple_awards,
        fields: vector<Field>[],
        application: table::new<String, Info>(ctx),
        index: 0,
        pool: table::new<u64, Info>(ctx),
        admins: vector<address>[ctx.sender()],
        confirmed: vector<address>[],
        ended: false
    }
}

public fun edit_fields(mut pool: LuckyPool, mut fields: vector<String>, mut encryption: vector<bool>, ctx: &TxContext) {
    assert!(pool.admins.contains(&ctx.sender()), E_Not_Admin);
    assert!(pool.fields.length() == 0 && pool.application.length() == 0 && pool.pool.length() == 0, E_Can_Not_Edit_Fields);
    assert!(fields.length() >= 0 && fields.length() <= 5 && fields.length() == encryption.length(), E_Not_Valid_Fields);
    assert!(!pool.ended, E_Ended_Pool);
    while (!fields.is_empty()) {
        let field = fields.pop_back();
        assert!(!fields.contains(&field), E_Not_Valid_Fields);
        pool.fields.push_back(Field {
            field,
            encryption: encryption.pop_back()
        });
    };
    fields.destroy_empty();
    encryption.destroy_empty();
    transfer::share_object(pool);
}

fun check_fields(fields: &vector<Field>, keys: &vector<String>): bool {
    if (fields.length() != keys.length()) {
        return false
    };
    let mut i = 0;
    while (i < fields.length()) {
        if (!keys.contains(&fields[i].field)) {
            return false
        };
        i = i + 1;
    };
    return true
}

entry fun apply(pool: &mut LuckyPool, addr_timer: String, mut keys: vector<String>, mut values: vector<String>) {
    assert!(check_fields(&pool.fields, &keys) && keys.length() == values.length(), E_Not_Valid_Fields);
    assert!(!pool.ended, E_Ended_Pool);
    let mut info = Info {
        fields: vec_map::empty<String, String>(),
        next: 0
    };
    while (!keys.is_empty()) {
        info.fields.insert(keys.pop_back(), values.pop_back());
    };
    pool.application.add(addr_timer, info);
    keys.destroy_empty();
    values.destroy_empty();
}

fun add_to_pool(pool: &mut LuckyPool, info: Info) {
    let index = pool.index;
    let Info {
        fields,
        next: _
    } = info;
    pool.pool.add(index, Info {
        fields,
        next: index
    });
    pool.index = pool.index + 1;
}

public fun edit_application(pool: &mut LuckyPool, mut keys: vector<String>, is_approve: bool, ctx: &TxContext) {
    assert!(pool.admins.contains(&ctx.sender()), E_Not_Admin);
    assert!(!pool.ended, E_Ended_Pool);
    while (!keys.is_empty()) {
        let key = keys.pop_back();
        if (!pool.application.contains(key)) {
            continue
        };
        let info = pool.application.remove(key);
        if (is_approve) {
            add_to_pool(pool, info);
        };
    };
}

entry fun edit_info(pool: &mut LuckyPool, index: u64, mut keys: vector<String>, mut values: vector<String>, ctx: &TxContext) {
    assert!(check_fields(&pool.fields, &keys) && keys.length() == values.length(), E_Not_Valid_Fields);
    assert!(pool.admins.contains(&ctx.sender()), E_Not_Admin);
    assert!(!pool.ended, E_Ended_Pool);
    let info = &mut pool.pool[index];
    while (!keys.is_empty()) {
        let key = keys.pop_back();
        let value = values.pop_back();
        let old_value = &mut info.fields[&key];
        *old_value = value;
    };
    keys.destroy_empty();
    values.destroy_empty();
}

entry fun add_admin(pool: &mut LuckyPool, mut addresses: vector<address>, ctx: &TxContext) {
    assert!(pool.admins.contains(&ctx.sender()), E_Not_Admin);
    assert!(!pool.ended, E_Ended_Pool);
    while (!addresses.is_empty()) {
        let address = addresses.pop_back();
        if (!pool.admins.contains(&address)) {
            pool.admins.push_back(address);
        };
    };
}

entry fun remove_admin(pool: &mut LuckyPool, mut addresses: vector<address>, ctx: &TxContext) {
    assert!(pool.admins.contains(&ctx.sender()), E_Not_Admin);
    assert!(!pool.ended, E_Ended_Pool);
    while (!addresses.is_empty()) {
        let address = addresses.pop_back();
        let (found, idx) = pool.admins.index_of(&address);
        if (found) {
            pool.admins.remove(idx);
        };
    };
    assert!(pool.admins.length() > 0, E_Can_Not_Remove_All_Admins);
}

entry fun confirm(pool: &mut LuckyPool, ctx: &TxContext) {
    assert!(pool.admins.contains(&ctx.sender()), E_Not_Admin);
    assert!(!pool.confirmed.contains(&ctx.sender()), E_Can_Not_Confirm_Twice);
    assert!(!pool.ended, E_Ended_Pool);
    pool.confirmed.push_back(ctx.sender());
}

fun draw_one_winner(pool: &mut LuckyPool, idx: u64): u64 {
    if (pool.allows_multiple_awards) {
        return idx
    };
    let next = pool.pool[idx].next;
    let boundary = pool.index - 1;
    if (next == idx) {
        let info = &mut pool.pool[idx];
        info.next = if (info.next + 1 > boundary) 0 else info.next + 1;
        return idx
    };
    let ret = draw_one_winner(pool, next);
    let info = &mut pool.pool[idx];
    info.next = if (ret + 1 > boundary) 0 else ret + 1;
    ret
}

entry fun lottery_draw(pool: &mut LuckyPool, time: String, random: &Random, ctx: &mut TxContext) {
    assert!(pool.admins.contains(&ctx.sender()), E_Not_Admin);
    assert!(pool.pool.length() >= pool.minimum_participants, E_Not_Meet_Minimum_Participants);
    assert!(pool.confirmed.length() >= (pool.admins.length() + 1) / 2, E_Need_Admins_Confirm);
    assert!(!pool.ended, E_Ended_Pool);

    // set ended
    pool.ended = true;

    // get generator
    let mut random_generator = random.new_generator(ctx);

    // draw
    let boundary = pool.index - 1;
    let mut amount = 0;
    let mut winners = b"".to_string();
    while (amount < pool.number_of_winners) {
        amount = amount + 1;
        if (amount > 1) {
            winners.append_utf8(b" ");
        };
        winners.append(draw_one_winner(pool, random_generator.generate_u64_in_range(0, boundary)).to_string());
    };

    // emit event
    emit(WinnersEvent {
        pool_id: pool.id.to_inner(),
        winners_list: winners,
        time
    });
}

public fun burn_pool(_: &Publisher, lucky_pool: LuckyPool, mut application_keys: vector<String>) {
    let LuckyPool {
        id,
        name: _,
        description: _,
        creation_time: _,
        minimum_participants: _,
        number_of_winners: _,
        allows_multiple_awards: _,
        fields: _,
        mut application,
        mut index,
        mut pool,
        admins: _,
        confirmed: _,
        ended: _
    } = lucky_pool;

    // delete id
    object::delete(id);

    // remove application
    while (!application_keys.is_empty()) {
        let key = application_keys.pop_back();
        application.remove(key);
    };
    application_keys.destroy_empty();
    application.destroy_empty();

    // remove pool info
    while (index > 0) {
        index = index - 1;
        pool.remove(index);
    };
    pool.destroy_empty();
}

entry fun seal_approve(id: vector<u8>, pool: &LuckyPool, ctx: &TxContext) {
    assert!(id == pool.id.to_bytes() && pool.admins.contains(&ctx.sender()), E_Not_Seal_Approve);
}