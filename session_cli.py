#!/usr/bin/env python3
"""
Command Line Interface for Session Manager

This script provides a command-line tool to interact with the SessionManager
for maintaining continuity between work sessions.

Usage:
    session_cli.py create "Session title" --project "Project name" --tools "Tool1,Tool2"
    session_cli.py note SESSION_ID "Note content" --tags "tag1,tag2"
    session_cli.py show [SESSION_ID]
    session_cli.py list
    session_cli.py search "query"
"""

import argparse
import json
import sys
from datetime import datetime
from typing import List, Optional
from session_manager import SessionManager


def format_session_display(session, show_notes=True):
    """Format session data for display in the terminal."""
    result = []
    result.append(f"Session ID: {session['session_id']}")
    result.append(f"Title: {session['title']}")
    result.append(f"Created: {session['created_at']}")
    result.append(f"Updated: {session['updated_at']}")
    
    if session.get('project'):
        result.append(f"Project: {session['project']}")
    
    if session.get('tools') and len(session['tools']) > 0:
        result.append(f"Tools: {', '.join(session['tools'])}")
    
    if session.get('metadata') and len(session['metadata']) > 0:
        result.append("Metadata:")
        for key, value in session['metadata'].items():
            result.append(f"  {key}: {value}")
    
    if show_notes and session.get('notes') and len(session['notes']) > 0:
        result.append("\nNotes:")
        for i, note in enumerate(session['notes'], 1):
            timestamp = note.get('timestamp', '')
            try:
                # Format the ISO timestamp to be more readable
                dt = datetime.fromisoformat(timestamp)
                formatted_time = dt.strftime("%Y-%m-%d %H:%M:%S")
            except (ValueError, TypeError):
                formatted_time = timestamp
                
            result.append(f"{i}. [{formatted_time}] {note['content']}")
            if note.get('tags') and len(note['tags']) > 0:
                result.append(f"   Tags: {', '.join(note['tags'])}")
    
    return "\n".join(result)


def create_session(args):
    """Create a new session."""
    manager = SessionManager()
    
    tools = args.tools.split(',') if args.tools else []
    
    session_id = manager.create_session(
        title=args.title,
        tools=tools,
        project=args.project
    )
    
    print(f"Created new session with ID: {session_id}")
    return session_id


def add_note(args):
    """Add a note to an existing session."""
    manager = SessionManager()
    
    tags = args.tags.split(',') if args.tags else []
    
    success = manager.add_notes_to_session(
        session_id=args.session_id,
        notes=args.content,
        tags=tags
    )
    
    if success:
        print(f"Note added to session {args.session_id}")
    else:
        print(f"Error: Session {args.session_id} not found")
        return 1
    return 0


def show_session(args):
    """Show details of a session."""
    manager = SessionManager()
    
    if args.session_id:
        session = manager.get_session(args.session_id)
        if not session:
            print(f"Error: Session {args.session_id} not found")
            return 1
    else:
        session = manager.get_latest_session()
        if not session:
            print("No sessions found")
            return 1
        print("Showing most recent session:")
    
    print("\n" + format_session_display(session))
    return 0


def list_sessions(args):
    """List all sessions."""
    manager = SessionManager()
    sessions = manager.get_all_sessions()
    
    if not sessions:
        print("No sessions found")
        return 0
    
    # Sort sessions by updated_at date (most recent first)
    sessions.sort(key=lambda s: s.get("updated_at", s.get("created_at", "")), reverse=True)
    
    print(f"Found {len(sessions)} sessions:\n")
    for session in sessions:
        print(format_session_display(session, show_notes=False))
        notes_count = len(session.get('notes', []))
        print(f"Notes: {notes_count}\n")
    
    return 0


def search_sessions(args):
    """Search for sessions matching a query."""
    manager = SessionManager()
    results = manager.search_sessions(args.query)
    
    if not results:
        print(f"No sessions found matching '{args.query}'")
        return 0
    
    print(f"Found {len(results)} sessions matching '{args.query}':\n")
    for session in results:
        print(format_session_display(session, show_notes=False))
        matching_notes = []
        for note in session.get('notes', []):
            if args.query.lower() in note.get('content', '').lower():
                matching_notes.append(note)
        
        if matching_notes:
            print(f"\nMatching notes ({len(matching_notes)}):")
            for note in matching_notes:
                print(f"- {note['content']}")
        
        print("\n" + "-" * 40 + "\n")
    
    return 0


def main():
    parser = argparse.ArgumentParser(description="Session Manager CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command")
    
    # Create session command
    create_parser = subparsers.add_parser("create", help="Create a new session")
    create_parser.add_argument("title", help="Session title")
    create_parser.add_argument("--project", help="Project name")
    create_parser.add_argument("--tools", help="Comma-separated list of tools")
    create_parser.set_defaults(func=create_session)
    
    # Add note command
    note_parser = subparsers.add_parser("note", help="Add a note to a session")
    note_parser.add_argument("session_id", help="Session ID")
    note_parser.add_argument("content", help="Note content")
    note_parser.add_argument("--tags", help="Comma-separated list of tags")
    note_parser.set_defaults(func=add_note)
    
    # Show session command
    show_parser = subparsers.add_parser("show", help="Show session details")
    show_parser.add_argument("session_id", nargs="?", help="Session ID (optional, shows latest if omitted)")
    show_parser.set_defaults(func=show_session)
    
    # List sessions command
    list_parser = subparsers.add_parser("list", help="List all sessions")
    list_parser.set_defaults(func=list_sessions)
    
    # Search sessions command
    search_parser = subparsers.add_parser("search", help="Search for sessions")
    search_parser.add_argument("query", help="Search query")
    search_parser.set_defaults(func=search_sessions)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())