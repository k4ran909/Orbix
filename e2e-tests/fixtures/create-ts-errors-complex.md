Tests delete-rename-write order
<Orbix-delete path="src/main.tsx">
</Orbix-delete>
<Orbix-rename from="src/App.tsx" to="src/main.tsx">
</Orbix-rename>
<Orbix-write path="src/main.tsx" description="final main.tsx file.">
finalMainTsxFileWithError();
</Orbix-write>
EOM
