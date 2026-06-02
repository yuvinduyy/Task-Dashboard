namespace App\Http/Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // READ: Get 5 most recent incomplete tasks
    public function index()
    {
        return response()->json(
            Task::where('is_completed', false)
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
        );
    }

    // CREATE: Store a new task
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max=255',
            'description' => 'nullable|string',
        ]);

        $task = Task::create($validated);
        return response()->json($task, 201);
    }

    // UPDATE: Modify title, description, or status
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max=255',
            'description' => 'nullable|string',
            'is_completed' => 'sometimes|required|boolean'
        ]);

        $task->update($validated);
        return response()->json($task);
    }

    // DELETE: Permanently remove a task
    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }
}