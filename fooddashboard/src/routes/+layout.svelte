<script>
    export let children; // Define 'children' as a prop
    import "../app.css";
</script>

<div class="p-4 bg-gray-100 min-h-screen">
    <slot>{children}</slot> <!-- Correct way to render child content -->
</div>
