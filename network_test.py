"""
Network connectivity test for FireEMS.ai application.

This script tests various aspects of network connectivity to help diagnose
issues with connecting to localhost servers.
"""

import socket
import subprocess
import sys
import os
import logging
import time
import threading

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_port_in_use(port):
    """Check if a port is in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def start_test_server(port):
    """Start a simple test server that listens on the specified port"""
    try:
        test_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        test_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        test_socket.bind(('127.0.0.1', port))
        test_socket.listen(1)
        logger.info(f"Test server listening on port {port}")
        conn, addr = test_socket.accept()
        logger.info(f"Connection received from {addr}")
        conn.send(b"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 11\r\n\r\nHello World")
        conn.close()
        test_socket.close()
    except Exception as e:
        logger.error(f"Error starting test server: {e}")

def test_localhost_connectivity():
    """Test connectivity to localhost"""
    logger.info("Testing localhost connectivity...")
    
    # Check if localhost resolves correctly
    try:
        localhost_ip = socket.gethostbyname('localhost')
        logger.info(f"localhost resolves to: {localhost_ip}")
    except socket.gaierror:
        logger.error("Could not resolve 'localhost'")
    
    # Check if 127.0.0.1 is accessible
    try:
        port = 9876
        
        # Check if port is already in use
        if check_port_in_use(port):
            logger.warning(f"Port {port} is already in use. Trying a different port.")
            port = 9877
        
        # Start a simple test server in a separate thread
        server_thread = threading.Thread(target=start_test_server, args=(port,))
        server_thread.daemon = True
        server_thread.start()
        
        # Give the server a moment to start
        time.sleep(1)
        
        # Try to connect to the test server
        logger.info(f"Attempting to connect to 127.0.0.1:{port}")
        test_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        test_socket.settimeout(5)
        result = test_socket.connect_ex(('127.0.0.1', port))
        
        if result == 0:
            logger.info(f"Successfully connected to 127.0.0.1:{port}")
            test_socket.send(b"GET / HTTP/1.1\r\nHost: localhost\r\n\r\n")
            response = test_socket.recv(1024)
            logger.info(f"Received response: {response}")
        else:
            logger.error(f"Failed to connect to 127.0.0.1:{port}, error code: {result}")
        
        test_socket.close()
    except Exception as e:
        logger.error(f"Error testing localhost connectivity: {e}")
    
    # Check if any localhost servers are running
    try:
        logger.info("Checking for listening ports...")
        if sys.platform == 'darwin':  # macOS
            result = subprocess.run(["netstat", "-an", "-p", "tcp"], 
                                   capture_output=True, text=True)
            lines = result.stdout.split('\n')
            listening_ports = [line for line in lines if '127.0.0.1' in line and 'LISTEN' in line]
            
            if listening_ports:
                logger.info("Found the following listening ports on localhost:")
                for line in listening_ports:
                    logger.info(line.strip())
            else:
                logger.warning("No listening ports found on localhost")
    except Exception as e:
        logger.error(f"Error checking listening ports: {e}")

def check_firewall():
    """Check if the firewall might be blocking connections"""
    logger.info("Checking firewall status...")
    
    try:
        if sys.platform == 'darwin':  # macOS
            result = subprocess.run(["defaults", "read", "/Library/Preferences/com.apple.alf", "globalstate"], 
                                   capture_output=True, text=True)
            if result.returncode == 0:
                firewall_status = result.stdout.strip()
                if firewall_status == '0':
                    logger.info("macOS Firewall is disabled")
                elif firewall_status == '1':
                    logger.warning("macOS Firewall is enabled but configured to allow signed software")
                elif firewall_status == '2':
                    logger.warning("macOS Firewall is enabled and blocking all incoming connections")
                else:
                    logger.warning(f"Unknown macOS Firewall status: {firewall_status}")
            else:
                logger.error("Could not determine macOS Firewall status")
    except Exception as e:
        logger.error(f"Error checking firewall status: {e}")

def check_network_interfaces():
    """Check network interfaces configuration"""
    logger.info("Checking network interfaces...")
    
    try:
        result = subprocess.run(["ifconfig"], capture_output=True, text=True)
        if result.returncode == 0:
            interfaces = result.stdout.split('\n\n')
            lo_interface = [iface for iface in interfaces if iface.startswith('lo0:')]
            
            if lo_interface:
                logger.info("Loopback interface configuration:")
                logger.info(lo_interface[0])
                
                # Check if 127.0.0.1 is configured on lo0
                if '127.0.0.1' in lo_interface[0]:
                    logger.info("Loopback interface has 127.0.0.1 configured")
                else:
                    logger.warning("127.0.0.1 not found in loopback interface configuration")
            else:
                logger.warning("Could not find loopback interface (lo0)")
    except Exception as e:
        logger.error(f"Error checking network interfaces: {e}")

def run_all_tests():
    """Run all network connectivity tests"""
    logger.info("=== NETWORK CONNECTIVITY DIAGNOSTIC ===")
    logger.info(f"Current working directory: {os.getcwd()}")
    logger.info(f"User: {os.getenv('USER')}")
    logger.info(f"Python version: {sys.version}")
    logger.info("=======================================")
    
    check_network_interfaces()
    check_firewall()
    test_localhost_connectivity()
    
    logger.info("=== DIAGNOSTIC COMPLETE ===")

if __name__ == "__main__":
    run_all_tests()