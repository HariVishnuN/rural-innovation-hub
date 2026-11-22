import pymysql

try:
    conn = pymysql.connect(host='127.0.0.1', user='root', password='nharivishnu31072008')
    with conn.cursor() as cur:
        cur.execute("CREATE USER IF NOT EXISTS 'hub_user'@'localhost' IDENTIFIED BY 'hub_password';")
        cur.execute("ALTER USER 'hub_user'@'localhost' IDENTIFIED BY 'hub_password';")
        cur.execute("GRANT ALL PRIVILEGES ON rural_innovation_hub.* TO 'hub_user'@'localhost';")

        cur.execute("CREATE USER IF NOT EXISTS 'hub_user'@'127.0.0.1' IDENTIFIED BY 'hub_password';")
        cur.execute("ALTER USER 'hub_user'@'127.0.0.1' IDENTIFIED BY 'hub_password';")
        cur.execute("GRANT ALL PRIVILEGES ON rural_innovation_hub.* TO 'hub_user'@'127.0.0.1';")

        cur.execute("CREATE USER IF NOT EXISTS 'hub_user'@'%' IDENTIFIED BY 'hub_password';")
        cur.execute("ALTER USER 'hub_user'@'%' IDENTIFIED BY 'hub_password';")
        cur.execute("GRANT ALL PRIVILEGES ON rural_innovation_hub.* TO 'hub_user'@'%';")

        cur.execute("FLUSH PRIVILEGES;")
    conn.commit()
    conn.close()
    print("SUCCESS: hub_user created/updated and granted full privileges on rural_innovation_hub!")
except Exception as e:
    print(f"Error creating hub_user: {e}")

# Now test connection as hub_user:hub_password
try:
    conn2 = pymysql.connect(host='127.0.0.1', user='hub_user', password='hub_password', database='rural_innovation_hub')
    with conn2.cursor() as cur:
        cur.execute("SELECT 1;")
        print("SUCCESS: Connected as hub_user@127.0.0.1 with hub_password!")
    conn2.close()
except Exception as e:
    print(f"hub_user@127.0.0.1 connection failed: {e}")

try:
    conn3 = pymysql.connect(host='localhost', user='hub_user', password='hub_password', database='rural_innovation_hub')
    with conn3.cursor() as cur:
        cur.execute("SELECT 1;")
        print("SUCCESS: Connected as hub_user@localhost with hub_password!")
    conn3.close()
except Exception as e:
    print(f"hub_user@localhost connection failed: {e}")
