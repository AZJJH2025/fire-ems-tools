"""
Documentation routes for Fire EMS Tools
Serves documentation files and provides documentation viewer
"""

import os
import logging
from flask import Blueprint, render_template, send_file, abort, request, jsonify
from markdown import markdown
import re

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('documentation', __name__, url_prefix='/docs')

def get_docs_directory():
    """Get the documentation directory path"""
    # Get the project root directory
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(project_root, 'docs')

def sanitize_path(path):
    """Sanitize file path to prevent directory traversal"""
    # Remove any directory traversal attempts
    path = path.replace('..', '').replace('//', '/')
    # Ensure it ends with .md
    if not path.endswith('.md'):
        path += '.md'
    return path

def convert_markdown_to_html(markdown_content):
    """Convert markdown content to HTML with enhanced formatting"""
    # Convert markdown to HTML
    html = markdown(markdown_content, extensions=['tables', 'fenced_code', 'toc'])
    
    # Add Bootstrap classes for better styling
    html = html.replace('<table>', '<table class="table table-striped table-bordered">')
    html = html.replace('<code>', '<code class="bg-light p-1">')
    html = html.replace('<h1>', '<h1 class="text-primary border-bottom pb-2">')
    html = html.replace('<h2>', '<h2 class="text-secondary mt-4">')
    html = html.replace('<h3>', '<h3 class="text-info mt-3">')
    
    return html

@bp.route('/')
def documentation_index():
    """Documentation index page"""
    try:
        docs_dir = get_docs_directory()
        readme_path = os.path.join(docs_dir, 'README.md')
        
        if not os.path.exists(readme_path):
            return render_template('docs_not_found.html'), 404
        
        with open(readme_path, 'r', encoding='utf-8') as f:
            markdown_content = f.read()
        
        html_content = convert_markdown_to_html(markdown_content)
        
        return render_template('documentation.html', 
                             content=html_content, 
                             title="Fire EMS Tools Documentation",
                             breadcrumb="Documentation Home")
    
    except Exception as e:
        logger.error(f"Error serving documentation index: {str(e)}")
        return render_template('docs_error.html', error=str(e)), 500

@bp.route('/<path:doc_path>')
def serve_documentation(doc_path):
    """Serve individual documentation files"""
    try:
        docs_dir = get_docs_directory()
        safe_path = sanitize_path(doc_path)
        full_path = os.path.join(docs_dir, safe_path)
        
        # Security check - ensure the file is within the docs directory
        if not os.path.commonpath([docs_dir, full_path]) == docs_dir:
            abort(403)
        
        if not os.path.exists(full_path):
            return render_template('docs_not_found.html', requested_path=doc_path), 404
        
        with open(full_path, 'r', encoding='utf-8') as f:
            markdown_content = f.read()
        
        html_content = convert_markdown_to_html(markdown_content)
        
        # Extract title from first heading or use filename
        title_match = re.search(r'^#\s+(.+)$', markdown_content, re.MULTILINE)
        title = title_match.group(1) if title_match else doc_path.replace('.md', '').replace('/', ' / ')
        
        # Create breadcrumb
        path_parts = doc_path.split('/')
        breadcrumb_parts = ['Documentation']
        for i, part in enumerate(path_parts[:-1]):
            breadcrumb_parts.append(part.replace('_', ' ').title())
        breadcrumb = ' / '.join(breadcrumb_parts)
        
        return render_template('documentation.html', 
                             content=html_content, 
                             title=title,
                             breadcrumb=breadcrumb,
                             doc_path=doc_path)
    
    except Exception as e:
        logger.error(f"Error serving documentation {doc_path}: {str(e)}")
        return render_template('docs_error.html', error=str(e)), 500

@bp.route('/api/search')
def search_documentation():
    """Search documentation content"""
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({'results': []})
        
        docs_dir = get_docs_directory()
        results = []
        
        # Search through all markdown files
        for root, dirs, files in os.walk(docs_dir):
            for file in files:
                if file.endswith('.md'):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, docs_dir)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        # Simple text search (case insensitive)
                        if query.lower() in content.lower():
                            # Extract title
                            title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
                            title = title_match.group(1) if title_match else file.replace('.md', '')
                            
                            # Find context around the match
                            lines = content.split('\n')
                            context_lines = []
                            for i, line in enumerate(lines):
                                if query.lower() in line.lower():
                                    start = max(0, i - 1)
                                    end = min(len(lines), i + 2)
                                    context_lines.extend(lines[start:end])
                                    break
                            
                            context = '\n'.join(context_lines[:3])  # Limit context
                            
                            results.append({
                                'title': title,
                                'path': rel_path.replace('\\', '/'),
                                'context': context[:200] + '...' if len(context) > 200 else context
                            })
                    
                    except Exception as e:
                        logger.warning(f"Error reading file {file_path}: {str(e)}")
                        continue
        
        # Limit results
        results = results[:10]
        
        return jsonify({'results': results, 'query': query})
    
    except Exception as e:
        logger.error(f"Error searching documentation: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/api/toc/<path:doc_path>')
def get_table_of_contents(doc_path):
    """Get table of contents for a documentation file"""
    try:
        docs_dir = get_docs_directory()
        safe_path = sanitize_path(doc_path)
        full_path = os.path.join(docs_dir, safe_path)
        
        if not os.path.exists(full_path):
            return jsonify({'error': 'File not found'}), 404
        
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract headings
        headings = []
        for match in re.finditer(r'^(#{1,6})\s+(.+)$', content, re.MULTILINE):
            level = len(match.group(1))
            text = match.group(2)
            # Create anchor ID
            anchor = re.sub(r'[^\w\s-]', '', text).strip()
            anchor = re.sub(r'[-\s]+', '-', anchor).lower()
            
            headings.append({
                'level': level,
                'text': text,
                'anchor': anchor
            })
        
        return jsonify({'headings': headings})
    
    except Exception as e:
        logger.error(f"Error getting TOC for {doc_path}: {str(e)}")
        return jsonify({'error': str(e)}), 500