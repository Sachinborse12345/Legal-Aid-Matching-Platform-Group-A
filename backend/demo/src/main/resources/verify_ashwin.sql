-- Manual verification for Ashwin
UPDATE lawyers SET verification_status = true WHERE bar_council_id = 'SAH/1233/2022';
UPDATE directory_entries SET verified = true WHERE bar_council_id = 'SAH/1233/2022' AND type = 'LAWYER';
