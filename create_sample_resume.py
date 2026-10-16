import pymupdf as fitz

doc = fitz.open()
page = doc.new_page()

text = """Alex Mercer
Senior Backend Engineer
alex.mercer@example.com | (555) 019-2834 | San Francisco, CA

SUMMARY
Backend engineer with 5 years of experience building high-throughput microservices,
optimizing relational database queries, and automating CI/CD deployments.

CORE TECHNICAL SKILLS
- Languages: Python, JavaScript, TypeScript, SQL
- Frameworks & Tools: FastAPI, Flask, Docker, Git, Redis
- Databases: PostgreSQL, MySQL, SQLite
- Infrastructure: Linux, AWS (EC2, S3), CI/CD pipelines with GitHub Actions
- Concepts: REST APIs, Object-Oriented Programming, Data Structures & Algorithms

PROFESSIONAL EXPERIENCE

Senior Software Engineer | CloudScale Systems (2022 - Present)
- Designed and maintained distributed Python microservices using FastAPI and Docker.
- Optimized PostgreSQL database schema and indexing, reducing p99 API query latency by 42%.
- Integrated Redis caching layer for session management and rate limiting across 25 nodes.
- Built automated CI/CD deployment pipelines using GitHub Actions and Linux shell scripts.

Software Engineer | FinTech Innovations (2020 - 2022)
- Built REST APIs in Python using Flask and SQLAlchemy for transaction processing.
- Managed relational data models across MySQL and PostgreSQL.
- Conducted unit testing and integration testing using pytest.
- Collaborated in an Agile Scrum environment with bi-weekly sprints.

EDUCATION
Bachelor of Science in Computer Science | State University (2020)
Relevant Coursework: Data Structures & Algorithms, Database Management Systems, Operating Systems.
"""

page.insert_text((50, 60), text, fontsize=11, fontname="helv")
doc.save("sample_developer_resume.pdf")
doc.close()
print("Created sample_developer_resume.pdf successfully.")
