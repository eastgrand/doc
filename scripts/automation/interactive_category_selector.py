#!/usr/bin/env python3
"""
Interactive Category Selection for Layer Grouping
Allows users to select which semantic categories to use for intelligent layer grouping
"""

import json
from typing import Dict, List, Any, Set
from pathlib import Path


class InteractiveCategorySelector:
    """Interactive system for selecting semantic categories for layer grouping"""
    
    def __init__(self):
        self.predefined_categories = self._get_predefined_categories()
        self.selected_categories = {}
        
    def _get_predefined_categories(self) -> Dict[str, Dict[str, Any]]:
        """Get predefined category options based on common business analyst data"""
        return {
            'demographics': {
                'display_name': 'Demographics & Population',
                'description': 'Age groups, generations, population characteristics',
                'keywords': [
                    'generation', 'age', 'population', 'demographics', 'cohort',
                    'alpha', 'gen z', 'millennial', 'boomer', 'seniors', 'youth',
                    'household', 'family', 'residents', 'people', 'children'
                ],
                'examples': [
                    'Generation Alpha Pop',
                    'Generation Z Pop', 
                    'Millennial Population',
                    'Senior Citizens'
                ]
            },
            
            'financial_services': {
                'display_name': 'Financial Services & Banking',
                'description': 'Bank usage, financial accounts, credit services',
                'keywords': [
                    'bank', 'banking', 'account', 'savings', 'checking', 'credit',
                    'loan', 'mortgage', 'financial', 'chase', 'wells fargo', 
                    'bank of america', 'citibank', 'td bank', 'pnc', 'regions'
                ],
                'examples': [
                    'Used Bank of America Bank 12 Mo',
                    'Have Savings Account',
                    'Have Personal Line of Credit'
                ]
            },
            
            'digital_payments': {
                'display_name': 'Digital Payment Services',
                'description': 'Mobile payments, digital wallets, payment apps',
                'keywords': [
                    'apple pay', 'google pay', 'paypal', 'venmo', 'zelle',
                    'digital payment', 'mobile payment', 'wallet', 'contactless',
                    'payment app', 'digital wallet', 'pay', 'payment service'
                ],
                'examples': [
                    'Used Apple Pay Digital Payment Svc',
                    'Used Google Pay Digital Payment Svc',
                    'Used PayPal Last 30 Days'
                ]
            },
            
            'investments': {
                'display_name': 'Investments & Assets',
                'description': 'Stocks, bonds, crypto, investment accounts',
                'keywords': [
                    'investment', 'cryptocurrency', 'crypto', 'bitcoin', 'stocks',
                    'bonds', 'mutual funds', 'portfolio', 'ira', '401k', 'retirement',
                    'assets', 'securities', 'trading', 'brokerage', 'etf'
                ],
                'examples': [
                    'Own Cryptocurrency Investment',
                    'Have IRA Account',
                    'Own Stocks/Bonds'
                ]
            },
            
            'credit_debt': {
                'display_name': 'Credit & Debt Management',
                'description': 'Credit cards, debt, credit behavior',
                'keywords': [
                    'credit card', 'debt', 'balance', 'carry balance', 'credit',
                    'loan', 'owe', 'payment', 'minimum payment', 'interest',
                    'debt management', 'credit score', 'credit report'
                ],
                'examples': [
                    'Carry Credit Card Balance 3-Usually Always',
                    'Have Credit Card Debt',
                    'Made Minimum Payment Only'
                ]
            },
            
            'tax_services': {
                'display_name': 'Tax Preparation Services',
                'description': 'Tax software, tax preparers, tax services',
                'keywords': [
                    'tax', 'turbotax', 'h&r block', 'tax preparation', 'tax prep',
                    'tax software', 'tax service', 'tax return', 'irs', 'filing',
                    'tax professional', 'cpa', 'accountant'
                ],
                'examples': [
                    'Used TurboTax Online to Prepare Taxes',
                    'Used H&R Block Tax Service',
                    'Used Tax Professional'
                ]
            },
            
            'retail_shopping': {
                'display_name': 'Retail & Shopping Behavior',
                'description': 'Shopping patterns, retail preferences, consumer behavior',
                'keywords': [
                    'shopping', 'retail', 'store', 'purchase', 'bought', 'spending',
                    'consumer', 'shop', 'mall', 'online shopping', 'ecommerce',
                    'amazon', 'walmart', 'target', 'costco', 'brand'
                ],
                'examples': [
                    'Shop at Target Regularly',
                    'Made Online Purchase Last 30 Days',
                    'Prefer Brand Name Products'
                ]
            },
            
            'technology_usage': {
                'display_name': 'Technology & Digital Services',
                'description': 'App usage, digital services, technology adoption',
                'keywords': [
                    'app', 'digital', 'online', 'mobile', 'internet', 'streaming',
                    'social media', 'technology', 'digital service', 'software',
                    'platform', 'website', 'digital platform'
                ],
                'examples': [
                    'Used Mobile Banking App',
                    'Stream Video Content',
                    'Use Social Media Daily'
                ]
            },
            
            'lifestyle_interests': {
                'display_name': 'Lifestyle & Interests',
                'description': 'Hobbies, sports, entertainment, lifestyle choices',
                'keywords': [
                    'sports', 'fitness', 'exercise', 'hobby', 'entertainment',
                    'music', 'travel', 'dining', 'recreation', 'leisure',
                    'outdoor', 'health', 'wellness', 'lifestyle'
                ],
                'examples': [
                    'Exercise Regularly',
                    'Attend Sporting Events',
                    'Travel for Leisure'
                ]
            },
            
            'income_wealth': {
                'display_name': 'Income & Wealth',
                'description': 'Income levels, wealth indicators, financial status',
                'keywords': [
                    'income', 'salary', 'wealth', 'affluent', 'earnings', 'wage',
                    'household income', 'disposable income', 'high income',
                    'financial status', 'economic status', 'prosperity'
                ],
                'examples': [
                    'High Household Income',
                    'Disposable Income Available',
                    'Affluent Lifestyle'
                ]
            }
        }
    
    def display_category_options(self):
        """Display all available category options"""
        print("\n🏷️  AVAILABLE SEMANTIC CATEGORIES FOR LAYER GROUPING")
        print("=" * 70)
        
        for i, (key, category) in enumerate(self.predefined_categories.items(), 1):
            print(f"\n{i}. {category['display_name']}")
            print(f"   Description: {category['description']}")
            print(f"   Keywords: {', '.join(category['keywords'][:8])}...")
            print(f"   Examples: {', '.join(category['examples'][:2])}")
    
    def interactive_selection(self) -> Dict[str, Dict]:
        """Interactive category selection process"""
        print("\n🎯 INTERACTIVE CATEGORY SELECTION")
        print("=" * 50)
        print("Choose which categories to use for semantic layer grouping.")
        print("You'll be asked yes/no for each category.\n")
        
        selected = {}
        
        for key, category in self.predefined_categories.items():
            print(f"\n📊 {category['display_name']}")
            print(f"   {category['description']}")
            print(f"   Examples: {', '.join(category['examples'])}")
            
            while True:
                response = input(f"\n   Use this category for grouping? (y/n/skip): ").lower().strip()
                if response in ['y', 'yes']:
                    selected[key] = category
                    print(f"   ✅ Added '{category['display_name']}' to selected categories")
                    break
                elif response in ['n', 'no']:
                    print(f"   ❌ Skipped '{category['display_name']}'")
                    break
                elif response in ['s', 'skip']:
                    print(f"   ⏭️  Skipped '{category['display_name']}'")
                    break
                else:
                    print("   Please enter 'y' for yes, 'n' for no, or 's' to skip")
        
        self.selected_categories = selected
        
        print(f"\n📋 SELECTION SUMMARY:")
        print(f"   Selected {len(selected)} out of {len(self.predefined_categories)} categories")
        
        if selected:
            print("\n✅ Selected Categories:")
            for key, category in selected.items():
                print(f"   • {category['display_name']}")
        
        return selected
    
    def quick_selection(self, preset: str = "comprehensive") -> Dict[str, Dict]:
        """Quick selection using presets"""
        presets = {
            'comprehensive': [
                'demographics', 'financial_services', 'digital_payments', 
                'investments', 'credit_debt', 'tax_services'
            ],
            'financial_focused': [
                'financial_services', 'digital_payments', 'investments', 
                'credit_debt', 'income_wealth'
            ],
            'consumer_focused': [
                'demographics', 'retail_shopping', 'technology_usage', 
                'lifestyle_interests'
            ],
            'minimal': [
                'demographics', 'financial_services', 'technology_usage'
            ]
        }
        
        if preset not in presets:
            preset = 'comprehensive'
        
        selected = {
            key: self.predefined_categories[key] 
            for key in presets[preset] 
            if key in self.predefined_categories
        }
        
        self.selected_categories = selected
        return selected
    
    def add_custom_category(self, name: str, display_name: str, 
                           description: str, keywords: List[str]) -> bool:
        """Add a custom category"""
        if name in self.selected_categories:
            return False
        
        self.selected_categories[name] = {
            'display_name': display_name,
            'description': description,
            'keywords': keywords,
            'examples': [],
            'custom': True
        }
        return True
    
    def save_selection(self, filepath: Path = None) -> bool:
        """Save selected categories to file"""
        if filepath is None:
            filepath = Path("selected_categories.json")
        
        try:
            with open(filepath, 'w') as f:
                json.dump(self.selected_categories, f, indent=2)
            print(f"📁 Saved category selection to: {filepath}")
            return True
        except Exception as e:
            print(f"❌ Failed to save categories: {e}")
            return False
    
    def load_selection(self, filepath: Path = None) -> bool:
        """Load selected categories from file"""
        if filepath is None:
            filepath = Path("selected_categories.json")
        
        try:
            if filepath.exists():
                with open(filepath, 'r') as f:
                    self.selected_categories = json.load(f)
                print(f"📁 Loaded category selection from: {filepath}")
                return True
            return False
        except Exception as e:
            print(f"❌ Failed to load categories: {e}")
            return False
    
    def get_category_keywords(self) -> Dict[str, List[str]]:
        """Get keywords for all selected categories"""
        return {
            key: category['keywords'] 
            for key, category in self.selected_categories.items()
        }
    
    def print_final_selection(self):
        """Print the final category selection"""
        if not self.selected_categories:
            print("\n⚠️  No categories selected!")
            return
        
        print(f"\n🎯 FINAL CATEGORY SELECTION ({len(self.selected_categories)} categories)")
        print("=" * 60)
        
        for key, category in self.selected_categories.items():
            print(f"\n📊 {category['display_name']}")
            print(f"   Key: {key}")
            print(f"   Keywords: {len(category['keywords'])} terms")
            print(f"   Primary terms: {', '.join(category['keywords'][:6])}...")


def main():
    """Test the interactive category selector"""
    selector = InteractiveCategorySelector()
    
    print("🧪 TESTING INTERACTIVE CATEGORY SELECTOR")
    print("=" * 50)
    
    # Option 1: Show all categories
    selector.display_category_options()
    
    # Option 2: Interactive selection
    print("\n" + "=" * 50)
    print("INTERACTIVE MODE:")
    selected = selector.interactive_selection()
    
    # Show final selection
    selector.print_final_selection()
    
    # Save selection
    selector.save_selection(Path("test_categories.json"))


if __name__ == "__main__":
    main()