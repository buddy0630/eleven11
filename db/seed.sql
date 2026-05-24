INSERT INTO products (name, price, description, img, category, quantity, rating, discount) VALUES
('ak-47',         99999, 'ak-47 neon pink skin',      'img/679eccaade337a001d7f619f.jpg',                          'mini-weapons',   100, 4, 10),
('R8 revolver',   98999, 'R8 revolver desant skin',   'img/165782411_3962972197093137_6875468421435181187_n.jpg',  'mini-weapons',   99,  5, 15),
('Keychain-1',    94999, 'Keychain figure',            'img/keychain-1.jpg',                                        'keychain',       95,  0, 0),
('Keychain-2',    93999, 'Keychain figure',            'img/keychain-2.jpg',                                        'keychain',       94,  2, 5),
('Desktop accessory', 92999, 'Desktop accessory',     'img/desktop-1.jpg',                                         'desktop-figure', 93,  5, 0),
('Desktop accessory', 91999, 'Desktop accessory',     'img/desktop-2.jpg',                                         'desktop-figure', 92,  4, 0),
('Bundles',       90999, 'Bundles of items',           'img/bundles-1.jpg',                                         'bundles',        91,  3, 20),
('Bundles',       89999, 'Bundles of items',           'img/bundles-2.jpg',                                         'bundles',        90,  5, 0);


INSERT INTO discounts (code, type, value, min_order, usage_limit, expires_at) VALUES
('FRAGLOOT20', 'percentage', 20, 50000, 100, NOW() + INTERVAL '30 days'),
('WELCOME10',  'percentage', 10, 0,     500, NOW() + INTERVAL '90 days');

INSERT INTO sales (name, description, start_date, end_date) VALUES
('Summer Sale', 'Big summer discounts on all mini weapons', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days');

INSERT INTO sale_products (sale_id, product_id, discount_percent) VALUES
(1, 1, 30),
(1, 2, 30);
