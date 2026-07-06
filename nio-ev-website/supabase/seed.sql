-- ============================================
-- NIO EV Website - Seed Data
-- Run this after the migration
-- ============================================

-- Seed Car Models
INSERT INTO public.car_models (name, category, tagline, range_km, top_speed_kmh, acceleration_0_100, battery_kwh, hero_image_url, side_image_url, price_usd, is_featured, display_order) VALUES
('ET7', 'ET', 'The flagship sedan that redefines luxury electric driving', 610, 200, 3.8, 100, '/images/hero-car.jpg', '/images/car-side.jpg', 69900, TRUE, 1),
('ET5', 'ET', 'Sporty elegance meets sustainable performance', 550, 195, 4.3, 75, '/images/hero-car.jpg', '/images/car-side.jpg', 52900, FALSE, 2),
('EC7', 'EC', 'The electric coupe SUV with breathtaking performance', 490, 200, 3.8, 100, '/images/hero-car.jpg', '/images/car-side.jpg', 74900, FALSE, 3),
('EC6', 'EC', 'A coupe SUV that blends style with intelligence', 465, 195, 4.5, 75, '/images/hero-car.jpg', '/images/car-side.jpg', 62900, FALSE, 4),
('ES8', 'ES', 'The premium smart electric flagship SUV', 510, 200, 4.1, 100, '/images/hero-car.jpg', '/images/car-side.jpg', 79900, FALSE, 5),
('ES6', 'ES', 'Smart electric SUV built for everyday excellence', 480, 195, 4.5, 75, '/images/community-car.jpg', '/images/car-side.jpg', 55900, FALSE, 6);

-- Seed Features
INSERT INTO public.features (number, title, description, icon_url, display_order) VALUES
('01', 'Cutting-Edge Technology', 'Experience The Future Of Navigation With Our Advanced ADAS System, Featuring 33 High-Performance Sensors, LiDAR Technology & Ultra Long Range Capabilities With 8MP High-Resolution Cameras.', '', 1),
('02', 'Nymi Voice Assistant', 'Meet Nymi, Your Personal Digital Auto Assistant That Understands Natural Language, Controls Your Vehicles Functions, And Even Anticipates Your Needs Through AI-Powered Learning.', '', 2),
('03', 'Sustainable Innovation', 'NIO Is Committed To Creating A Greener Future Through Innovative Battery Swapping, Renewable Energy And AI Recycling Programs, Setting New Standards In Sustainable Luxury.', '', 3),
('04', 'Ownership Experience', 'NIO Redefines Than A Car - Its A Lifestyle. Experience Charging Network, NIO Houses, NIO Life Merchandise, Exclusive Events, And A Community That Shares Your Vision.', '', 4);

-- Seed Site Content
INSERT INTO public.site_content (section_key, title, subtitle, body, image_url) VALUES
('hero', 'DRIVE THE FUTURE TODAY', 'More Than A Car, Its A Statement Of Progressive Luxury. Experience The Perfect Blend Of Innovation And Sustainable Elegance.', '', '/images/hero-car.jpg'),
('future', 'The Future of Luxury is Electric', 'Step into the future of automotive excellence. Advanced technology that transforms every journey into an extraordinary experience.', '', ''),
('tech', 'Your NIO Adapts And Evolves, Advanced AI Learns Your Preferences While Autonomous Driving Capabilities', 'And Smart Cockpit Features Create A Seamless Connection Between You And Your Vehicle.', '', '/images/dashboard.jpg'),
('beyond', 'Beyond Electric — Driving The Future Forward', 'NIO Redefines Cars With Advanced Technology, Comprehensive Design, Smart Services And Sustainable Innovation.', '', ''),
('community', 'Be Part of the Nio Community', 'Join a vibrant community of forward-thinking drivers who share a passion for innovation, sustainability, and the future of mobility.', '', '/images/community-car.jpg');
