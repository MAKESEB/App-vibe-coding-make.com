# Rinde Gastos Make App

This custom app integrates Make with the Rinde Gastos REST API.

## Authentication

Create a connection with a Rinde Gastos company API token. In Rinde Gastos, the token is available from Admin > Integracion after API access is enabled for the company.

## Included modules

- Search Expenses (searchExpenses)
- Get an Expense (getExpense)
- Set Expense Integration (setExpenseIntegration)
- Search Expense Reports (searchExpenseReports)
- Get an Expense Report (getExpenseReport)
- Set Expense Report Integration (setExpenseReportIntegration)
- Set Expense Report Custom Status (setExpenseReportCustomStatus)
- Search Funds (searchFunds)
- Get a Fund (getFund)
- Create a Fund (createFund)
- Update a Fund (updateFund)
- Deposit Money to a Fund (depositMoneyToFund)
- Withdraw Money from a Fund (withdrawMoneyFromFund)
- Set Fund Status (setFundStatus)
- Search Expense Policies (searchExpensePolicies)
- Get an Expense Policy (getExpensePolicy)
- List Expense Policy Report Fields (listExpensePolicyReportFields)
- List Expense Policy Expense Fields (listExpensePolicyExpenseFields)
- List Expense Policy Categories (listExpensePolicyCategories)
- List Expense Policy Workflow (listExpensePolicyWorkflow)
- List Expense Policy Taxes (listExpensePolicyTaxes)
- Search Users (searchUsers)
- Get a User (getUser)
- Make an API Call (makeAnApiCall)

## Upload

Set Make credentials and run:

```bash
MAKE_API_KEY=... MAKE_ZONE=eu1.make.com ./scripts/rindegastos/upload-rindegastos-app.sh
```

The upload script creates the private Make custom app if needed, creates the API token connection object, uploads the connection sections, creates/updates every module, and uploads module sections.
