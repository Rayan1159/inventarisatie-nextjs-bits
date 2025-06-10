import requests
import sys
import time
import uuid
from datetime import datetime

class InventoryAPITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_category = f"TestCategory_{uuid.uuid4().hex[:8]}"
        self.test_data = {}

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                    return False, response.json()
                except:
                    return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_create_category(self):
        """Test creating a new category"""
        success, response = self.run_test(
            "Create Category",
            "POST",
            "database/inventory/categories/update",
            200,
            data={"category": self.test_category}
        )
        return success

    def test_add_columns(self):
        """Test adding columns to a category"""
        columns = ["Name", "Description"]
        success = True
        
        for column in columns:
            column_success, _ = self.run_test(
                f"Add Column '{column}'",
                "POST",
                "database/inventory/categories/items/update",
                200,
                data={"category": self.test_category, "items": {"item_name": column}}
            )
            success = success and column_success
            
        return success

    def test_create_entry(self):
        """Test creating a new entry"""
        success, response = self.run_test(
            "Create Entry",
            "POST",
            "database/entry/create",
            200,
            data={"category": self.test_category}
        )
        
        if success and 'id' in response:
            self.test_data['entry_id'] = response['id']
            print(f"Created entry with ID: {self.test_data['entry_id']}")
            return True
        return False

    def test_update_entry_values(self):
        """Test updating values for an entry"""
        if 'entry_id' not in self.test_data:
            print("❌ No entry ID available for testing updates")
            return False
            
        entry_id = self.test_data['entry_id']
        
        # Update Name field
        name_success, _ = self.run_test(
            "Update Name Field",
            "POST",
            "database/inventory/categories/values/update",
            200,
            data={
                "category": self.test_category,
                "item": "Name",
                "value": "Test Item",
                "id": entry_id
            }
        )
        
        # Update Description field
        desc_success, _ = self.run_test(
            "Update Description Field",
            "POST",
            "database/inventory/categories/values/update",
            200,
            data={
                "category": self.test_category,
                "item": "Description",
                "value": "Test Description",
                "id": entry_id
            }
        )
        
        return name_success and desc_success

    def test_create_multiple_entries(self):
        """Test creating multiple entries and updating them independently"""
        # Create first entry
        success1, response1 = self.run_test(
            "Create First Entry",
            "POST",
            "database/entry/create",
            200,
            data={"category": self.test_category}
        )
        
        if success1 and 'id' in response1:
            entry_id1 = response1['id']
            print(f"Created first entry with ID: {entry_id1}")
        else:
            return False
            
        # Create second entry
        success2, response2 = self.run_test(
            "Create Second Entry",
            "POST",
            "database/entry/create",
            200,
            data={"category": self.test_category}
        )
        
        if success2 and 'id' in response2:
            entry_id2 = response2['id']
            print(f"Created second entry with ID: {entry_id2}")
        else:
            return False
            
        # Update first entry's Name field
        update1_success, _ = self.run_test(
            "Update First Entry Name",
            "POST",
            "database/inventory/categories/values/update",
            200,
            data={
                "category": self.test_category,
                "item": "Name",
                "value": "First Item",
                "id": entry_id1
            }
        )
        
        # Update second entry's Name field
        update2_success, _ = self.run_test(
            "Update Second Entry Name",
            "POST",
            "database/inventory/categories/values/update",
            200,
            data={
                "category": self.test_category,
                "item": "Name",
                "value": "Second Item",
                "id": entry_id2
            }
        )
        
        # Verify the values by getting all category values
        verify_success, response = self.run_test(
            "Verify Multiple Entries",
            "POST",
            "database/inventory/categories/values",
            200,
            data={"category": self.test_category}
        )
        
        if verify_success and 'values' in response and 'values' in response['values']:
            entries = response['values']['values']
            
            # Find our entries
            entry1 = next((e for e in entries if e['id'] == entry_id1), None)
            entry2 = next((e for e in entries if e['id'] == entry_id2), None)
            
            if entry1 and entry2:
                # Extract name values
                name1 = next((v['value'] for v in entry1['values'] if v['key'] == 'Name'), None)
                name2 = next((v['value'] for v in entry2['values'] if v['key'] == 'Name'), None)
                
                if name1 == "First Item" and name2 == "Second Item":
                    print("✅ Verified both entries have correct independent values")
                    return True
                else:
                    print(f"❌ Values don't match: Entry1 Name={name1}, Entry2 Name={name2}")
            else:
                print("❌ Couldn't find both entries in response")
        
        return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting API tests with test category: {self.test_category}")
        
        # Step 1: Create category
        if not self.test_create_category():
            print("❌ Failed to create category, stopping tests")
            return False
            
        # Step 2: Add columns
        if not self.test_add_columns():
            print("❌ Failed to add columns, stopping tests")
            return False
            
        # Step 3: Test multiple entries (this is the key test for the bug)
        if not self.test_create_multiple_entries():
            print("❌ Failed multiple entries test, which means the row saving bug may still exist")
            return False
            
        print(f"\n📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        return self.tests_passed == self.tests_run

def main():
    # Use the local server URL
    tester = InventoryAPITester("http://localhost:8000")
    
    # Run all tests
    success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
