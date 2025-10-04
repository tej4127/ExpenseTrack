import { ExpenseForm } from "@/components/expense-form";

export default function NewExpensePage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Submit a New Expense</h1>
                <p className="text-muted-foreground">
                    Fill out the form below or upload a receipt to get started.
                </p>
            </div>
            <ExpenseForm />
        </div>
    )
}
