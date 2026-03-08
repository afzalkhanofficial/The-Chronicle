const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Post = require('../models/Post');
const Category = require('../models/Category');
const Comment = require('../models/Comment');
const slugify = require('slugify');

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Post.deleteMany({});
        await Category.deleteMany({});
        await Comment.deleteMany({});
        console.log('Cleared existing data');

        // Create users
        const users = await User.create([
            {
                username: 'admin',
                email: 'admin@blog.com',
                password: 'admin123',
                role: 'admin',
                bio: 'Platform administrator and tech enthusiast. Managing the blog and curating the best content for our readers.',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
            },
            {
                username: 'sarah_writes',
                email: 'sarah@blog.com',
                password: 'author123',
                role: 'author',
                bio: 'Full-stack developer and technical writer. Passionate about making complex topics accessible to everyone.',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
            },
            {
                username: 'mike_dev',
                email: 'mike@blog.com',
                password: 'author123',
                role: 'author',
                bio: 'Software engineer specializing in cloud computing and DevOps. Love sharing knowledge through writing.',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'
            },
            {
                username: 'reader_jane',
                email: 'jane@blog.com',
                password: 'user123',
                role: 'user',
                bio: 'Avid reader and aspiring developer. Always eager to learn new technologies.',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane'
            }
        ]);
        console.log('Created users');

        // Create categories
        const categories = await Category.create([
            { name: 'Technology', slug: 'technology', description: 'Latest in tech and innovation', color: '#6366f1' },
            { name: 'Web Development', slug: 'web-development', description: 'Frontend and backend web technologies', color: '#06b6d4' },
            { name: 'Data Science', slug: 'data-science', description: 'Data analysis, ML, and AI', color: '#8b5cf6' },
            { name: 'DevOps', slug: 'devops', description: 'CI/CD, cloud, and infrastructure', color: '#f59e0b' },
            { name: 'Lifestyle', slug: 'lifestyle', description: 'Work-life balance and productivity', color: '#ec4899' },
            { name: 'Tutorials', slug: 'tutorials', description: 'Step-by-step coding guides', color: '#10b981' }
        ]);
        console.log('Created categories');

        // Create posts
        const posts = await Post.create([
            {
                title: 'Getting Started with React 18: A Comprehensive Guide',
                slug: 'getting-started-with-react-18',
                content: `# Getting Started with React 18\n\nReact 18 brings exciting new features that make building modern web applications even more powerful. In this comprehensive guide, we'll explore everything you need to know to get started.\n\n## What's New in React 18?\n\nReact 18 introduces several groundbreaking features:\n\n### Automatic Batching\nReact 18 automatically batches state updates, even inside promises, timeouts, and native event handlers. This means fewer re-renders and better performance out of the box.\n\n### Concurrent Features\nThe new concurrent renderer allows React to prepare multiple versions of the UI at the same time. This enables features like:\n- **Transitions**: Mark state updates as non-urgent\n- **Suspense improvements**: Better handling of async operations\n- **Streaming SSR**: Faster server-side rendering\n\n### New Hooks\n\n\`\`\`javascript\n// useTransition - for non-urgent updates\nconst [isPending, startTransition] = useTransition();\n\nstartTransition(() => {\n  setSearchQuery(input);\n});\n\n// useDeferredValue - defer rendering of non-critical content\nconst deferredValue = useDeferredValue(value);\n\n// useId - generate unique IDs\nconst id = useId();\n\`\`\`\n\n## Setting Up a React 18 Project\n\nThe easiest way to get started is with Vite:\n\n\`\`\`bash\nnpm create vite@latest my-app -- --template react\ncd my-app\nnpm install\nnpm run dev\n\`\`\`\n\n## Best Practices\n\n1. **Use Strict Mode** - Helps identify potential problems\n2. **Embrace Suspense** - For data fetching and code splitting\n3. **Use Transitions** - For non-urgent UI updates\n4. **Keep Components Small** - Better performance and readability\n\n## Conclusion\n\nReact 18 is a significant step forward for the React ecosystem. The new concurrent features open up exciting possibilities for building responsive, performant applications.`,
                excerpt: 'React 18 brings exciting new features including automatic batching, concurrent rendering, and powerful new hooks. Learn everything you need to get started.',
                coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
                author: users[1]._id,
                category: categories[1]._id,
                tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
                status: 'published',
                featured: true,
                views: 1250,
                likes: [users[0]._id, users[2]._id, users[3]._id]
            },
            {
                title: 'Building RESTful APIs with Node.js and Express',
                slug: 'building-restful-apis-nodejs-express',
                content: `# Building RESTful APIs with Node.js and Express\n\nCreating robust APIs is a fundamental skill for modern web developers. Let's dive into building production-ready RESTful APIs using Node.js and Express.\n\n## Project Setup\n\n\`\`\`bash\nmkdir api-project\ncd api-project\nnpm init -y\nnpm install express mongoose dotenv cors\n\`\`\`\n\n## Project Structure\n\n\`\`\`\n/api-project\n├── /controllers\n├── /models\n├── /routes\n├── /middleware\n├── server.js\n└── .env\n\`\`\`\n\n## Creating the Server\n\n\`\`\`javascript\nconst express = require('express');\nconst app = express();\n\napp.use(express.json());\n\napp.get('/api/health', (req, res) => {\n  res.json({ status: 'ok' });\n});\n\napp.listen(3000, () => console.log('Server running'));\n\`\`\`\n\n## Middleware\n\nMiddleware functions have access to the request, response, and next function:\n\n\`\`\`javascript\nconst authMiddleware = (req, res, next) => {\n  const token = req.headers.authorization;\n  if (!token) return res.status(401).json({ error: 'Unauthorized' });\n  // Verify token...\n  next();\n};\n\`\`\`\n\n## Error Handling\n\nAlways implement proper error handling in your APIs. Use try-catch blocks and create custom error classes for better error management.\n\n## Best Practices\n\n- Use proper HTTP status codes\n- Implement input validation\n- Add rate limiting\n- Use HTTPS in production\n- Document your API\n\nBuilding APIs with Node.js and Express gives you the flexibility and performance you need for modern applications.`,
                excerpt: 'Learn how to build production-ready RESTful APIs using Node.js and Express with proper structure, middleware, and error handling.',
                coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop',
                author: users[2]._id,
                category: categories[1]._id,
                tags: ['Node.js', 'Express', 'API', 'Backend'],
                status: 'published',
                featured: true,
                views: 980,
                likes: [users[0]._id, users[1]._id]
            },
            {
                title: 'Introduction to Machine Learning with Python',
                slug: 'introduction-machine-learning-python',
                content: `# Introduction to Machine Learning with Python\n\nMachine Learning is revolutionizing how we solve problems. Python, with its rich ecosystem of libraries, is the go-to language for ML practitioners.\n\n## What is Machine Learning?\n\nMachine Learning is a subset of artificial intelligence that gives systems the ability to learn and improve from experience without being explicitly programmed.\n\n## Types of Machine Learning\n\n### 1. Supervised Learning\n- Classification (spam detection, image recognition)\n- Regression (price prediction, weather forecasting)\n\n### 2. Unsupervised Learning\n- Clustering (customer segmentation)\n- Dimensionality reduction (data visualization)\n\n### 3. Reinforcement Learning\n- Game playing agents\n- Robotics\n\n## Getting Started with scikit-learn\n\n\`\`\`python\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score\n\n# Split data\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\n\n# Train model\nmodel = RandomForestClassifier(n_estimators=100)\nmodel.fit(X_train, y_train)\n\n# Predict\npredictions = model.predict(X_test)\nprint(f'Accuracy: {accuracy_score(y_test, predictions)}')\n\`\`\`\n\n## Essential Libraries\n\n- **NumPy** - Numerical computing\n- **Pandas** - Data manipulation\n- **Matplotlib/Seaborn** - Visualization\n- **scikit-learn** - Machine learning\n- **TensorFlow/PyTorch** - Deep learning\n\nThe field of ML is vast and constantly evolving. Start with the basics and gradually explore more complex algorithms and techniques.`,
                excerpt: 'Explore the fundamentals of Machine Learning using Python. From supervised to reinforcement learning, get started with scikit-learn and essential ML libraries.',
                coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
                author: users[1]._id,
                category: categories[2]._id,
                tags: ['Python', 'Machine Learning', 'AI', 'Data Science'],
                status: 'published',
                featured: true,
                views: 2100,
                likes: [users[0]._id, users[2]._id, users[3]._id]
            },
            {
                title: 'Docker and Kubernetes: A DevOps Essential Guide',
                slug: 'docker-kubernetes-devops-guide',
                content: `# Docker and Kubernetes: A DevOps Essential Guide\n\nContainerization has transformed how we build, ship, and run applications. Docker and Kubernetes are the cornerstone technologies every DevOps engineer should master.\n\n## Docker Fundamentals\n\n### What is Docker?\nDocker is a platform that uses containerization to package applications with all their dependencies into standardized units called containers.\n\n### Creating a Dockerfile\n\n\`\`\`dockerfile\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]\n\`\`\`\n\n### Docker Compose\n\n\`\`\`yaml\nversion: '3.8'\nservices:\n  web:\n    build: .\n    ports:\n      - "3000:3000"\n    depends_on:\n      - db\n  db:\n    image: mongo:6\n    volumes:\n      - mongo-data:/data/db\nvolumes:\n  mongo-data:\n\`\`\`\n\n## Kubernetes Basics\n\nKubernetes (K8s) is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications.\n\n### Key Concepts\n- **Pods** - Smallest deployable units\n- **Services** - Network abstraction\n- **Deployments** - Declarative updates\n- **ConfigMaps & Secrets** - Configuration management\n\n## Best Practices\n\n1. Use multi-stage builds for smaller images\n2. Never run containers as root\n3. Use resource limits in Kubernetes\n4. Implement health checks\n5. Use namespaces for environment separation`,
                excerpt: 'Master Docker and Kubernetes essentials for modern DevOps. Learn containerization, orchestration, and best practices for production deployments.',
                coverImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=400&fit=crop',
                author: users[2]._id,
                category: categories[3]._id,
                tags: ['Docker', 'Kubernetes', 'DevOps', 'Cloud'],
                status: 'published',
                featured: false,
                views: 750,
                likes: [users[1]._id]
            },
            {
                title: 'The Art of Writing Clean Code',
                slug: 'art-of-writing-clean-code',
                content: `# The Art of Writing Clean Code\n\nWriting clean code is not just about making your code work — it's about making it readable, maintainable, and elegant. Clean code is a craft that every developer should aspire to master.\n\n## Principles of Clean Code\n\n### 1. Meaningful Names\nUse intention-revealing names for variables, functions, and classes.\n\n\`\`\`javascript\n// Bad\nconst d = new Date();\nconst fn = (a, b) => a + b;\n\n// Good\nconst currentDate = new Date();\nconst calculateTotal = (price, tax) => price + tax;\n\`\`\`\n\n### 2. Single Responsibility Principle\nEach function should do one thing and do it well.\n\n### 3. DRY (Don't Repeat Yourself)\nAvoid code duplication. Extract common logic into reusable functions.\n\n### 4. Keep Functions Small\nFunctions should typically be no longer than 20 lines. If they are, consider breaking them down.\n\n### 5. Write Self-Documenting Code\nYour code should be readable enough that comments become unnecessary for understanding the logic.\n\n## Code Smells to Avoid\n\n- Long methods\n- Deep nesting\n- Magic numbers\n- God classes\n- Premature optimization\n\n## Refactoring Tips\n\n1. Start with tests\n2. Make small, incremental changes\n3. Rename for clarity\n4. Extract methods\n5. Remove dead code\n\nClean code is an investment that pays dividends in reduced bugs, easier debugging, and happier team members.`,
                excerpt: 'Learn the principles and practices of writing clean, maintainable code. From meaningful names to the Single Responsibility Principle.',
                coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910auj7?w=800&h=400&fit=crop',
                author: users[1]._id,
                category: categories[0]._id,
                tags: ['Clean Code', 'Best Practices', 'Software Engineering'],
                status: 'published',
                featured: false,
                views: 1800,
                likes: [users[0]._id, users[2]._id]
            },
            {
                title: 'CSS Grid vs Flexbox: When to Use What',
                slug: 'css-grid-vs-flexbox',
                content: `# CSS Grid vs Flexbox: When to Use What\n\nCSS Grid and Flexbox are powerful layout systems that serve different purposes. Understanding when to use each one will level up your CSS skills.\n\n## Flexbox: One-Dimensional Layouts\n\nFlexbox is perfect for laying out items in a single direction — either a row or a column.\n\n\`\`\`css\n.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1rem;\n}\n\`\`\`\n\n### Best Use Cases\n- Navigation bars\n- Card rows\n- Centering content\n- Equal height columns\n\n## CSS Grid: Two-Dimensional Layouts\n\nCSS Grid excels at creating complex, two-dimensional layouts with rows AND columns.\n\n\`\`\`css\n.grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  grid-gap: 2rem;\n}\n\`\`\`\n\n### Best Use Cases\n- Page layouts\n- Photo galleries\n- Dashboard layouts\n- Magazine-style layouts\n\n## Using Both Together\n\nThe best approach is often to use Grid for the overall page layout and Flexbox for component-level layouts.\n\n\`\`\`css\n.page {\n  display: grid;\n  grid-template-columns: 250px 1fr;\n}\n\n.sidebar nav {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n\`\`\`\n\n## Quick Decision Guide\n\n| Feature | Flexbox | Grid |\n|---------|---------|------|\n| Dimensions | 1D | 2D |\n| Content-based | Yes | Yes |\n| Gap support | Yes | Yes |\n| Overlap items | No | Yes |\n| Best for | Components | Layouts |`,
                excerpt: 'Understand the key differences between CSS Grid and Flexbox, and learn when to use each layout system for optimal results.',
                coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=400&fit=crop',
                author: users[2]._id,
                category: categories[5]._id,
                tags: ['CSS', 'Flexbox', 'Grid', 'Frontend'],
                status: 'published',
                featured: false,
                views: 1450,
                likes: [users[3]._id, users[1]._id]
            },
            {
                title: 'Work-Life Balance for Software Developers',
                slug: 'work-life-balance-developers',
                content: `# Work-Life Balance for Software Developers\n\nIn the fast-paced world of software development, maintaining a healthy work-life balance is crucial for long-term success and well-being.\n\n## The Burnout Problem\n\nBurnout is a significant issue in the tech industry. Long hours, tight deadlines, and the pressure to stay current with rapidly evolving technologies can take a toll.\n\n### Signs of Burnout\n- Chronic fatigue\n- Decreased productivity\n- Cynicism about work\n- Difficulty concentrating\n- Physical symptoms (headaches, insomnia)\n\n## Strategies for Balance\n\n### 1. Set Clear Boundaries\n- Define working hours and stick to them\n- Turn off notifications after hours\n- Have a dedicated workspace separate from living areas\n\n### 2. Practice the Pomodoro Technique\nWork in focused 25-minute intervals with 5-minute breaks. Take a longer break every 4 intervals.\n\n### 3. Exercise Regularly\nPhysical activity reduces stress, improves mood, and boosts cognitive function.\n\n### 4. Learn to Say No\nNot every meeting needs your attendance. Not every feature needs to be built immediately.\n\n### 5. Invest in Hobbies\nHaving interests outside of coding helps you recharge and brings fresh perspectives.\n\n## Productivity Tips\n\n- Batch similar tasks together\n- Use the Eisenhower Matrix for prioritization\n- Automate repetitive tasks\n- Take regular breaks (your brain needs rest to be creative)\n\nRemember: You are more than your code. Taking care of yourself makes you a better developer.`,
                excerpt: 'Discover practical strategies for maintaining work-life balance as a software developer. Combat burnout and boost productivity.',
                coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop',
                author: users[1]._id,
                category: categories[4]._id,
                tags: ['Lifestyle', 'Productivity', 'Mental Health', 'Career'],
                status: 'published',
                featured: false,
                views: 920,
                likes: [users[0]._id, users[3]._id]
            },
            {
                title: 'MongoDB Aggregation Pipeline: From Basics to Advanced',
                slug: 'mongodb-aggregation-pipeline',
                content: `# MongoDB Aggregation Pipeline\n\nThe aggregation pipeline is one of MongoDB's most powerful features. It allows you to process and transform documents through a sequence of stages.\n\n## Pipeline Stages\n\n### $match\nFilter documents in the pipeline:\n\`\`\`javascript\n{ $match: { status: "published", views: { $gt: 100 } } }\n\`\`\`\n\n### $group\nGroup documents and calculate aggregates:\n\`\`\`javascript\n{\n  $group: {\n    _id: "$category",\n    totalPosts: { $sum: 1 },\n    avgViews: { $avg: "$views" }\n  }\n}\n\`\`\`\n\n### $sort and $limit\n\`\`\`javascript\n{ $sort: { totalPosts: -1 } },\n{ $limit: 5 }\n\`\`\`\n\n### $lookup (Joins)\n\`\`\`javascript\n{\n  $lookup: {\n    from: "users",\n    localField: "author",\n    foreignField: "_id",\n    as: "authorInfo"\n  }\n}\n\`\`\`\n\n## Real-World Example\n\nGet top categories with post counts:\n\`\`\`javascript\ndb.posts.aggregate([\n  { $match: { status: "published" } },\n  { $group: { _id: "$category", count: { $sum: 1 } } },\n  { $sort: { count: -1 } },\n  { $limit: 10 }\n]);\n\`\`\`\n\nThe aggregation pipeline is essential for analytics, reporting, and complex data transformations in MongoDB applications.`,
                excerpt: 'Master MongoDB aggregation pipeline from basic stages like $match and $group to advanced operations like $lookup and $unwind.',
                coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400&fit=crop',
                author: users[2]._id,
                category: categories[5]._id,
                tags: ['MongoDB', 'Database', 'NoSQL', 'Backend'],
                status: 'published',
                featured: false,
                views: 670,
                likes: [users[0]._id]
            }
        ]);
        console.log('Created posts');

        // Create comments
        await Comment.create([
            {
                content: 'Great article! React 18 concurrent features are game-changing. I especially love the useTransition hook for search inputs.',
                post: posts[0]._id,
                user: users[3]._id,
                likes: [users[1]._id]
            },
            {
                content: 'Really well explained. The code examples make it easy to follow along. Would love to see a follow-up on Server Components!',
                post: posts[0]._id,
                user: users[2]._id,
                likes: [users[0]._id, users[3]._id]
            },
            {
                content: 'This is exactly what I needed to get started with Node.js APIs. The middleware section was particularly helpful.',
                post: posts[1]._id,
                user: users[3]._id,
                likes: [users[2]._id]
            },
            {
                content: 'Excellent introduction to ML! The scikit-learn example is very accessible for beginners.',
                post: posts[2]._id,
                user: users[0]._id,
                likes: [users[1]._id, users[3]._id]
            },
            {
                content: 'I always get confused between Grid and Flexbox. This article finally cleared things up for me!',
                post: posts[5]._id,
                user: users[3]._id,
                likes: [users[2]._id]
            },
            {
                content: 'The burnout section really resonated with me. Taking breaks is so important but often overlooked. Thank you for this reminder.',
                post: posts[6]._id,
                user: users[0]._id,
                likes: [users[1]._id]
            }
        ]);

        // Update comment counts
        for (const post of posts) {
            const count = await Comment.countDocuments({ post: post._id });
            await Post.findByIdAndUpdate(post._id, { commentsCount: count });
        }

        console.log('Created comments');
        console.log('\\n--- Seed Complete ---');
        console.log('\\nLogin Credentials:');
        console.log('Admin:  admin@blog.com / admin123');
        console.log('Author: sarah@blog.com / author123');
        console.log('Author: mike@blog.com / author123');
        console.log('User:   jane@blog.com / user123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedDB();
