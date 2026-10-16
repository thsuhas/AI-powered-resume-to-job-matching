"""
Synthetic Benchmark Dataset for CareerLens Skill Extraction & Matching Evaluation.

NOTE: This dataset contains synthetically constructed resumes and job postings with
curated ground-truth skill annotations. It is intended for reproducible pipeline
benchmarking and component testing, and does not represent real personal candidate records.
"""

from typing import List, Dict, Any

SYNTHETIC_EVALUATION_DATASET: List[Dict[str, Any]] = [
    {
        "id": "sample-01",
        "role": "Backend Python Developer",
        "resume_text": """
            Senior Software Engineer with 4 years of experience building scalable backend services.
            Proficient in Python, FastAPI, and Flask. Strong experience designing relational database
            schemas with PostgreSQL and writing optimized SQL queries.
            Implemented containerized deployments using Docker and automated CI/CD pipelines with GitHub Actions.
            Familiar with Redis for caching and session storage.
        """,
        "job_description": """
            We are looking for a Backend Python Engineer to join our core platform team.
            Requirements:
            - Strong command of Python and web frameworks such as FastAPI or Django.
            - Solid database knowledge including PostgreSQL and SQL query optimization.
            - Hands-on experience with Docker containerization and CI/CD pipelines.
            - Experience with Redis is a plus.
        """,
        # Ground-truth technical skills present in resume text
        "expected_resume_skills": ["Python", "FastAPI", "Flask", "PostgreSQL", "SQL", "Docker", "CI/CD", "Redis"],
        # Ground-truth technical skills required by job description
        "expected_jd_skills": ["Python", "FastAPI", "Django", "PostgreSQL", "SQL", "Docker", "CI/CD", "Redis"],
        # Candidate ranking relevance score for this job (0 to 3 scale)
        "relevance_label": 3
    },
    {
        "id": "sample-02",
        "role": "Frontend React Engineer",
        "resume_text": """
            Frontend Developer specializing in modern UI development.
            Extensive work with React, TypeScript, and Next.js. Skilled in CSS, HTML, and responsive design.
            Integrated REST APIs and GraphQL endpoints for single-page applications.
            Collaborated using Git version control and participated in Agile sprints.
        """,
        "job_description": """
            Seeking a React Frontend Developer to craft responsive web applications.
            Key Qualifications:
            - 2+ years working with React and TypeScript.
            - Experience with Next.js and state management.
            - Proven experience consuming REST APIs and GraphQL.
            - Proficiency in Git and Agile development methodologies.
        """,
        "expected_resume_skills": ["React", "TypeScript", "Next.js", "REST APIs", "GraphQL", "Git", "Agile"],
        "expected_jd_skills": ["React", "TypeScript", "Next.js", "REST APIs", "GraphQL", "Git", "Agile"],
        "relevance_label": 3
    },
    {
        "id": "sample-03",
        "role": "Machine Learning Engineer",
        "resume_text": """
            Applied Data Scientist with strong background in machine learning and NLP.
            Developed predictive models using scikit-learn, PyTorch, and TensorFlow.
            Extensive data manipulation experience using NumPy and Pandas.
            Deployed inference services as RESTful microservices using FastAPI and Docker.
        """,
        "job_description": """
            Looking for an ML Engineer to build natural language processing models.
            Required:
            - Deep understanding of Machine Learning and Deep Learning concepts.
            - Experience with PyTorch or TensorFlow for deep neural networks.
            - Strong Python programming with NumPy, Pandas, and scikit-learn.
            - Experience deploying models with Docker and REST APIs.
        """,
        "expected_resume_skills": ["Machine Learning", "NLP", "scikit-learn", "PyTorch", "TensorFlow", "NumPy", "Pandas", "FastAPI", "Docker", "REST APIs"],
        "expected_jd_skills": ["Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Python", "NumPy", "Pandas", "scikit-learn", "Docker", "REST APIs"],
        "relevance_label": 3
    },
    {
        "id": "sample-04",
        "role": "DevOps & Cloud Engineer",
        "resume_text": """
            Cloud Operations Engineer with hands-on expertise in AWS cloud services (EC2, S3, RDS).
            Automated infrastructure provisioning with Kubernetes and Docker containers.
            Configured CI/CD delivery pipelines and managed Linux server environments with Bash scripting.
            Solid version control practices with Git.
        """,
        "job_description": """
            DevOps Engineer needed to maintain cloud infrastructure.
            Requirements:
            - Experience managing AWS or GCP environments.
            - Expertise in Kubernetes orchestration and Docker.
            - Solid Linux systems administration skills.
            - Knowledge of CI/CD pipelines and Git.
        """,
        "expected_resume_skills": ["AWS", "Kubernetes", "Docker", "CI/CD", "Linux", "Git"],
        "expected_jd_skills": ["AWS", "GCP", "Kubernetes", "Docker", "Linux", "CI/CD", "Git"],
        "relevance_label": 3
    },
    {
        "id": "sample-05",
        "role": "Full Stack Engineer (Java/React)",
        "resume_text": """
            Software Engineer working across the full stack.
            Backend development in Java using Object-Oriented Programming principles.
            Familiar with MySQL relational database management and writing unit tests with pytest.
            Built internal tools in JavaScript and managed codebase via Git.
        """,
        "job_description": """
            Full Stack Developer wanted.
            Requirements:
            - Java backend service development and Object-Oriented Programming.
            - Relational database experience with MySQL or PostgreSQL.
            - Frontend skills in React or TypeScript.
            - Testing & QA focus with unit testing frameworks.
        """,
        "expected_resume_skills": ["Java", "Object-Oriented Programming", "MySQL", "Testing & QA", "JavaScript", "Git"],
        "expected_jd_skills": ["Java", "Object-Oriented Programming", "MySQL", "PostgreSQL", "React", "TypeScript", "Testing & QA"],
        "relevance_label": 2
    },
    {
        "id": "sample-06",
        "role": "Junior Data Analyst",
        "resume_text": """
            Recent Computer Science graduate with coursework in Data Structures & Algorithms.
            Proficient in Python for data analysis using Pandas and NumPy.
            Created SQL queries in MySQL for coursework projects.
            Basic familiarity with Git and Linux command line.
        """,
        "job_description": """
            Junior Data Analyst position.
            Candidate should have:
            - Strong Python data handling skills using Pandas and NumPy.
            - Proficiency in writing SQL queries on relational databases.
            - Strong foundations in Data Structures & Algorithms.
            - Version control experience with Git.
        """,
        "expected_resume_skills": ["Data Structures & Algorithms", "Python", "Pandas", "NumPy", "SQL", "MySQL", "Git", "Linux"],
        "expected_jd_skills": ["Python", "Pandas", "NumPy", "SQL", "Data Structures & Algorithms", "Git"],
        "relevance_label": 3
    },
    {
        "id": "sample-07",
        "role": "Systems Programmer (C++)",
        "resume_text": """
            Systems Software Developer focusing on high-performance C++ applications.
            Implemented low-latency algorithms, multithreading, and network protocols in C++.
            Comfortable in Linux environments with shell scripting.
            Practiced Agile sprint workflows and code reviews via Git.
        """,
        "job_description": """
            Systems Programmer position.
            Must have:
            - Expert C++ programming experience and memory management.
            - Linux OS fundamentals and performance tuning.
            - Understanding of Object-Oriented Programming and Data Structures & Algorithms.
            - Agile team collaboration.
        """,
        "expected_resume_skills": ["C++", "Linux", "Agile", "Git"],
        "expected_jd_skills": ["C++", "Linux", "Object-Oriented Programming", "Data Structures & Algorithms", "Agile"],
        "relevance_label": 2
    },
    {
        "id": "sample-08",
        "role": "Database Administrator",
        "resume_text": """
            Database Administrator with 5 years managing high-availability database clusters.
            Specialized in PostgreSQL, MySQL, and SQLite.
            Advanced SQL tuning, indexing, and replication setup.
            Automated backup scripts in Linux using Bash and Python.
        """,
        "job_description": """
            Senior Database Administrator.
            Requirements:
            - Deep expertise in PostgreSQL and MySQL administration.
            - Advanced SQL performance tuning and database modeling.
            - Linux environment automation using Python or Bash.
            - Experience with Redis caching is a strong plus.
        """,
        "expected_resume_skills": ["PostgreSQL", "MySQL", "SQLite", "SQL", "Linux", "Python"],
        "expected_jd_skills": ["PostgreSQL", "MySQL", "SQL", "Linux", "Python", "Redis"],
        "relevance_label": 3
    },
    {
        "id": "sample-09",
        "role": "Node.js & Cloud Developer",
        "resume_text": """
            Backend Engineer with expertise in Node.js, Express, and TypeScript.
            Built REST APIs and integrated MongoDB NoSQL databases.
            Deployed microservices to AWS utilizing Docker containers and GitHub CI/CD.
        """,
        "job_description": """
            Looking for a Node.js Backend Engineer.
            Requirements:
            - Experience building REST APIs in Node.js and Express.
            - Knowledge of TypeScript and MongoDB.
            - Cloud deployment using AWS, Docker, and CI/CD pipelines.
        """,
        "expected_resume_skills": ["Node.js", "Express", "TypeScript", "REST APIs", "MongoDB", "AWS", "Docker", "CI/CD"],
        "expected_jd_skills": ["Node.js", "Express", "REST APIs", "TypeScript", "MongoDB", "AWS", "Docker", "CI/CD"],
        "relevance_label": 3
    },
    {
        "id": "sample-10",
        "role": "Software QA Engineer",
        "resume_text": """
            Quality Assurance Automation Engineer.
            Created automated test suites using Python and pytest for backend REST APIs.
            Integrated testing pipelines into CI/CD workflows with Docker.
            Collaborated closely with developers in an Agile environment using Git.
        """,
        "job_description": """
            Software QA Engineer.
            Requirements:
            - Automated test development with Testing & QA frameworks like pytest.
            - API testing for REST APIs.
            - Experience in CI/CD pipeline integration and Docker.
            - Teamwork in an Agile development environment using Git.
        """,
        "expected_resume_skills": ["Testing & QA", "Python", "REST APIs", "CI/CD", "Docker", "Agile", "Git"],
        "expected_jd_skills": ["Testing & QA", "REST APIs", "CI/CD", "Docker", "Agile", "Git"],
        "relevance_label": 3
    }
]
