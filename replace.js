const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist') && !file.includes('.drizzle')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.sql') || file.endsWith('.json') || file.endsWith('.html')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('d:\\echo');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Plurals and specific compound words
  content = content.replace(/spaceMembers/g, 'spaceMembers');
  content = content.replace(/space_members/g, 'space_members');
  
  content = content.replace(/spaceUid/g, 'spaceUid');
  content = content.replace(/space_uid/g, 'space_uid');
  
  content = content.replace(/spaceName/g, 'spaceName');
  content = content.replace(/space_name/g, 'space_name');
  
  content = content.replace(/spaces/g, 'spaces');
  content = content.replace(/Spaces/g, 'Spaces');
  content = content.replace(/SPACES/g, 'SPACES');
  
  content = content.replace(/space/g, 'space');
  content = content.replace(/Space/g, 'Space');
  content = content.replace(/SPACE/g, 'SPACE');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
});
