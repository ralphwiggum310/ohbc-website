# Bible Database Documentation

## Database Schema

### Table: `bible_versions`

| Column | Type | Not Null | Default | PK |
|--------|------|----------|---------|----|
| id | INTEGER | False | NULL | True |
| name | TEXT | True | NULL | False |
| abbreviation | TEXT | True | NULL | False |
| description | TEXT | False | NULL | False |
| language | TEXT | False | NULL | False |
| copyright | TEXT | False | NULL | False |
| info | TEXT | False | NULL | False |

**Indexes:**

- `idx_bible_versions_abbreviation`
- `sqlite_autoindex_bible_versions_1`

### Table: `books`

| Column | Type | Not Null | Default | PK |
|--------|------|----------|---------|----|
| id | INTEGER | False | NULL | True |
| name | TEXT | True | NULL | False |
| testament | TEXT | False | NULL | False |
| chapters | INTEGER | False | NULL | False |
| display_order | INTEGER | False | NULL | False |

**Indexes:**

- `idx_books_name`
- `sqlite_autoindex_books_1`

### Table: `verses`

| Column | Type | Not Null | Default | PK |
|--------|------|----------|---------|----|
| id | INTEGER | False | NULL | True |
| version_id | INTEGER | False | NULL | False |
| book_id | INTEGER | False | NULL | False |
| chapter | INTEGER | True | NULL | False |
| verse | INTEGER | True | NULL | False |
| text | TEXT | True | NULL | False |

**Indexes:**

- `idx_verses_version_id`
- `idx_verses_book_chapter_verse`
- `sqlite_autoindex_verses_1`

## Version Information

| Abbreviation | Name | Description | Language |
|--------------|------|-------------|----------|
| KJV | King James Version | The Authorized King James Version | English |
| ASV | American Standard Version | American Standard Version (1901) | English |
| WEB | World English Bible | World English Bible | English |
| ERV | English Revised Version | English Revised Version (1885) | English |
| NIV | New International Version | New International Version (2011) | English |
| NASB | New American Standard Bible | New American Standard Bible (1995) | English |
