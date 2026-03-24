npx prisma generate
npx prisma migrate dev --name init_acsp_schema
echo "# Class_Project" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/amanraj2205/Class_Project.git
git push -u origin main