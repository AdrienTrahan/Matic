parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"
cd ./mjml
for file in *.mjml; do
  if [ -e "$file" ]; then
    # Compile MJML to HTML
    ../../../../../node_modules/.bin/mjml "$file" -o "../compiled/${file%.mjml}.html"
  fi
done
echo "Compiled MJML files"